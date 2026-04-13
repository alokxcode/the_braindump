import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useEffect, useState } from "react";
import { Alert, AppState, Platform } from "react-native";

export interface LocalThought {
  _id: string;
  text: string;
  _creationTime: number;
}

const STORAGE_FOLDER_KEY = "braindump_storage_folder";
const DEFAULT_LOCAL_FOLDER = "braindump_thoughts";

// Get today's date in YYYY-MM-DD format
const getTodayFileName = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useLocalStorage = () => {
  const [thoughts, setThoughts] = useState<LocalThought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [currentDateFile, setCurrentDateFile] = useState<string>("");
  const [activeDateKey, setActiveDateKey] = useState(getTodayFileName());

  // Initialize storage on mount
  useEffect(() => {
    initializeStorage();
  }, []);

  const isSafUri = useCallback(
    (uri: string) => uri.startsWith("content://"),
    [],
  );

  const getInternalFolderPath = useCallback(() => {
    const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
    if (!base) return null;
    return `${base}${DEFAULT_LOCAL_FOLDER}`;
  }, []);

  const ensureInternalFolder = useCallback(async (): Promise<string | null> => {
    try {
      const internalPath = getInternalFolderPath();
      if (!internalPath) return null;

      const info = await FileSystem.getInfoAsync(internalPath);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(internalPath, {
          intermediates: true,
        });
      }

      setFolderPath(internalPath);
      await AsyncStorage.setItem(STORAGE_FOLDER_KEY, internalPath);
      return internalPath;
    } catch (error) {
      console.error("Error creating internal folder:", error);
      return null;
    }
  }, [getInternalFolderPath]);

  const findTodaySafFile = useCallback(async (folderUri: string) => {
    const fileName = `${getTodayFileName()}.json`;
    const files =
      await FileSystem.StorageAccessFramework.readDirectoryAsync(folderUri);
    return (
      files.find((uri) => decodeURIComponent(uri).includes(fileName)) ?? null
    );
  }, []);

  const canAccessFolder = useCallback(
    async (folder: string): Promise<boolean> => {
      try {
        if (isSafUri(folder)) {
          await FileSystem.StorageAccessFramework.readDirectoryAsync(folder);
          return true;
        }

        const info = await FileSystem.getInfoAsync(folder);
        if (!info.exists) {
          await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
        }
        return true;
      } catch (error) {
        console.warn("Folder access check failed:", folder, error);
        return false;
      }
    },
    [isSafUri],
  );

  const getTodayFileUri = useCallback(
    async (folder: string, createIfMissing: boolean) => {
      const fileName = `${getTodayFileName()}.json`;

      if (isSafUri(folder)) {
        const existing = await findTodaySafFile(folder);
        if (existing) return existing;
        if (!createIfMissing) return null;

        return await FileSystem.StorageAccessFramework.createFileAsync(
          folder,
          fileName,
          "application/json",
        );
      }

      return `${folder}/${fileName}`;
    },
    [findTodaySafFile, isSafUri],
  );

  const initializeStorage = useCallback(async () => {
    try {
      setIsLoading(true);
      // Get saved folder path
      const savedFolder = await AsyncStorage.getItem(STORAGE_FOLDER_KEY);
      console.log("Initializing storage, saved folder:", savedFolder);

      if (savedFolder) {
        const canUseSavedFolder = await canAccessFolder(savedFolder);
        if (canUseSavedFolder) {
          setFolderPath(savedFolder);
          await loadThoughtsFromFile(savedFolder);
        } else {
          console.warn(
            "Saved folder is no longer accessible, switching to internal storage",
          );
          const internalFolder = await ensureInternalFolder();
          if (internalFolder) {
            await loadThoughtsFromFile(internalFolder);
          }
        }
      } else {
        console.log("No saved folder, creating internal folder");
        const internalFolder = await ensureInternalFolder();
        if (internalFolder) {
          console.log("Internal folder path:", internalFolder);
          await loadThoughtsFromFile(internalFolder);
        }
      }
    } catch (error) {
      console.error("Error initializing storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, [canAccessFolder, ensureInternalFolder]);

  const loadThoughtsFromFile = useCallback(
    async (folder: string) => {
      try {
        const dateKey = getTodayFileName();
        const fileUri = await getTodayFileUri(folder, false);
        console.log("Loading thoughts from:", fileUri, "Date key:", dateKey);
        setCurrentDateFile(`${dateKey}.json`);
        setActiveDateKey(dateKey);

        if (!fileUri) {
          console.log("No file URI found, setting empty thoughts");
          setThoughts([]);
          return;
        }

        try {
          const fileContent = await FileSystem.readAsStringAsync(fileUri);
          if (!fileContent || fileContent.trim().length === 0) {
            console.log("File is empty, setting empty thoughts");
            setThoughts([]);
            return;
          }

          const parsedThoughts = JSON.parse(fileContent);
          const thoughtsList = Array.isArray(parsedThoughts) ? parsedThoughts : [];
          console.log("Loaded thoughts count:", thoughtsList.length);
          setThoughts(thoughtsList);
        } catch (parseError) {
          // File exists but has corrupted JSON - delete it and start fresh
          console.log("File has corrupted JSON, deleting:", parseError);
          try {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
          } catch (deleteError) {
            console.error("Failed to delete corrupted file:", deleteError);
          }
          setThoughts([]);
        }
      } catch (error) {
        console.error("Error loading thoughts:", error);
        setThoughts([]);
      }
    },
    [getTodayFileUri],
  );

  const ensureCurrentDateContext = useCallback(async (): Promise<boolean> => {
    const todayKey = getTodayFileName();
    if (todayKey === activeDateKey) {
      return false;
    }

    const targetFolder = folderPath ?? (await ensureInternalFolder());
    if (targetFolder) {
      await loadThoughtsFromFile(targetFolder);
    } else {
      setThoughts([]);
      setCurrentDateFile(`${todayKey}.json`);
      setActiveDateKey(todayKey);
    }

    return true;
  }, [activeDateKey, ensureInternalFolder, folderPath, loadThoughtsFromFile]);

  useEffect(() => {
    const checkDateRollover = () => {
      ensureCurrentDateContext();
    };

    const interval = setInterval(checkDateRollover, 60000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkDateRollover();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [ensureCurrentDateContext]);

  const saveThoughtsToFile = useCallback(
    async (newThoughts: LocalThought[]): Promise<boolean> => {
      try {
        const targetFolder = folderPath ?? (await ensureInternalFolder());
        if (!targetFolder) {
          console.error("No target folder available for saving thoughts");
          return false;
        }

        const writeToFolder = async (folder: string): Promise<boolean> => {
          const fileUri = await getTodayFileUri(folder, true);
          if (!fileUri) {
            console.error("Failed to get file URI for thoughts");
            return false;
          }

          console.log("Saving thoughts to:", fileUri, "Count:", newThoughts.length);

          const jsonString = JSON.stringify(newThoughts, null, 2);

          if (isSafUri(fileUri)) {
            await FileSystem.writeAsStringAsync(fileUri, jsonString, {
              encoding: "utf8",
            });
          } else {
            await FileSystem.writeAsStringAsync(fileUri, jsonString);
          }

          await new Promise((resolve) => setTimeout(resolve, 100));

          try {
            const verification = await FileSystem.readAsStringAsync(fileUri);
            if (!verification || verification.trim().length === 0) {
              console.error("File is empty after write");
              return false;
            }
            const verifiedThoughts = JSON.parse(verification);
            if (!Array.isArray(verifiedThoughts)) {
              console.error("Verified data is not an array");
              return false;
            }
            console.log("Verified saved thoughts, count:", verifiedThoughts.length);
          } catch (parseError) {
            console.error("Verification failed, but proceeding:", parseError);
          }

          return true;
        };

        let saved = false;
        try {
          saved = await writeToFolder(targetFolder);
        } catch (error) {
          console.warn("Primary save failed:", error);
        }

        if (!saved && isSafUri(targetFolder)) {
          console.warn(
            "SAF folder save failed, falling back to internal app storage",
          );
          const fallbackFolder = await ensureInternalFolder();
          if (fallbackFolder) {
            try {
              saved = await writeToFolder(fallbackFolder);
            } catch (fallbackError) {
              console.error("Fallback save failed:", fallbackError);
            }
          }
        }

        if (!saved) {
          return false;
        }

        // Only update state after successful write
        setThoughts(newThoughts);
        setCurrentDateFile(`${getTodayFileName()}.json`);
        return true;
      } catch (error) {
        console.error("Error saving thoughts to file:", error);
        return false;
      }
    },
    [ensureInternalFolder, folderPath, getTodayFileUri, isSafUri],
  );

  const addThought = useCallback(
    async (text: string): Promise<LocalThought | null> => {
      const rolledOver = await ensureCurrentDateContext();
      const newThought: LocalThought = {
        _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        _creationTime: Date.now(),
      };
      const baseThoughts = rolledOver ? [] : thoughts;
      const updated = [newThought, ...baseThoughts];

      const saved = await saveThoughtsToFile(updated);
      if (!saved) {
        Alert.alert(
          "Error",
          "Failed to save thought to file. Please try again.",
          [{ text: "OK" }]
        );
        return null;
      }

      return newThought;
    },
    [ensureCurrentDateContext, thoughts, saveThoughtsToFile],
  );

  const updateThought = useCallback(
    async (id: string, text: string) => {
      const rolledOver = await ensureCurrentDateContext();
      if (rolledOver) return false;

      const updated = thoughts.map((t) => (t._id === id ? { ...t, text } : t));
      const saved = await saveThoughtsToFile(updated);
      if (!saved) {
        Alert.alert(
          "Error",
          "Failed to update thought. Please try again.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    },
    [ensureCurrentDateContext, thoughts, saveThoughtsToFile],
  );

  const deleteThought = useCallback(
    async (id: string) => {
      const rolledOver = await ensureCurrentDateContext();
      if (rolledOver) return false;

      const updated = thoughts.filter((t) => t._id !== id);
      const saved = await saveThoughtsToFile(updated);
      if (!saved) {
        Alert.alert(
          "Error",
          "Failed to delete thought. Please try again.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    },
    [ensureCurrentDateContext, thoughts, saveThoughtsToFile],
  );

  const deleteAllThoughts = useCallback(async () => {
    if (!folderPath) {
      setThoughts([]);
      return { deletedFiles: 0 };
    }

    let deletedFiles = 0;

    try {
      if (isSafUri(folderPath)) {
        const uris =
          await FileSystem.StorageAccessFramework.readDirectoryAsync(
            folderPath,
          );
        const jsonUris = uris.filter((uri) =>
          decodeURIComponent(uri).toLowerCase().includes(".json"),
        );

        for (const uri of jsonUris) {
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
            deletedFiles += 1;
          } catch (error) {
            console.error("Error deleting file:", uri, error);
          }
        }
      } else {
        const names = await FileSystem.readDirectoryAsync(folderPath);
        const jsonNames = names.filter((name) =>
          name.toLowerCase().endsWith(".json"),
        );

        for (const name of jsonNames) {
          const uri = `${folderPath}/${name}`;
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
            deletedFiles += 1;
          } catch (error) {
            console.error("Error deleting file:", uri, error);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting all JSON files:", error);
    }

    setThoughts([]);
    setCurrentDateFile(`${getTodayFileName()}.json`);
    return { deletedFiles };
  }, [folderPath, isSafUri]);

  const selectFolder = useCallback(async (): Promise<string | null> => {
    try {
      if (Platform.OS !== "android") {
        return null;
      }

      const result =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (result.granted && result.directoryUri) {
        const selectedPath = result.directoryUri;
        setFolderPath(selectedPath);
        await AsyncStorage.setItem(STORAGE_FOLDER_KEY, selectedPath);
        await loadThoughtsFromFile(selectedPath);
        return selectedPath;
      }
      return null;
    } catch (error) {
      console.error("Error selecting folder:", error);
      return null;
    }
  }, [loadThoughtsFromFile]);

  const getFolderPath = useCallback(async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_FOLDER_KEY);
    } catch {
      return null;
    }
  }, []);

  return {
    thoughts,
    isLoading,
    folderPath,
    currentDateFile,
    addThought,
    updateThought,
    deleteThought,
    deleteAllThoughts,
    selectFolder,
    getFolderPath,
    reloadThoughts: () => folderPath && loadThoughtsFromFile(folderPath),
  };
};
