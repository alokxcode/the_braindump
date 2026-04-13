import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export interface LocalThought {
  _id: string;
  text: string;
  _creationTime: number;
}

const STORAGE_FOLDER_KEY = "braindump_storage_folder";

// Get today's date in YYYY-MM-DD format
const getTodayFileName = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Returns YYYY-MM-DD
};

export const useLocalStorage = () => {
  const [thoughts, setThoughts] = useState<LocalThought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [currentDateFile, setCurrentDateFile] = useState<string>("");

  // Initialize storage on mount
  useEffect(() => {
    initializeStorage();
  }, []);

  const isSafUri = useCallback(
    (uri: string) => uri.startsWith("content://"),
    [],
  );

  const findTodaySafFile = useCallback(async (folderUri: string) => {
    const fileName = `${getTodayFileName()}.json`;
    const files =
      await FileSystem.StorageAccessFramework.readDirectoryAsync(folderUri);
    return (
      files.find((uri) => decodeURIComponent(uri).includes(fileName)) ?? null
    );
  }, []);

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

      if (savedFolder) {
        setFolderPath(savedFolder);
        await loadThoughtsFromFile(savedFolder);
      }
    } catch (error) {
      console.error("Error initializing storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadThoughtsFromFile = useCallback(
    async (folder: string) => {
      try {
        const fileUri = await getTodayFileUri(folder, false);
        setCurrentDateFile(`${getTodayFileName()}.json`);

        if (!fileUri) {
          setThoughts([]);
          return;
        }

        try {
          const fileContent = await FileSystem.readAsStringAsync(fileUri);
          const parsedThoughts = JSON.parse(fileContent);
          setThoughts(Array.isArray(parsedThoughts) ? parsedThoughts : []);
        } catch (error) {
          // File doesn't exist yet, initialize empty array
          setThoughts([]);
        }
      } catch (error) {
        console.error("Error loading thoughts:", error);
        setThoughts([]);
      }
    },
    [getTodayFileUri],
  );

  const saveThoughtsToFile = useCallback(
    async (newThoughts: LocalThought[]) => {
      try {
        if (!folderPath) return;

        const fileUri = await getTodayFileUri(folderPath, true);
        if (!fileUri) return;

        // Write thoughts to JSON file
        await FileSystem.writeAsStringAsync(
          fileUri,
          JSON.stringify(newThoughts, null, 2),
        );
        setThoughts(newThoughts);
        setCurrentDateFile(`${getTodayFileName()}.json`);
      } catch (error) {
        console.error("Error saving thoughts:", error);
      }
    },
    [folderPath, getTodayFileUri],
  );

  const addThought = useCallback(
    async (text: string): Promise<LocalThought> => {
      const newThought: LocalThought = {
        _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        _creationTime: Date.now(),
      };
      const updated = [newThought, ...thoughts];
      await saveThoughtsToFile(updated);
      return newThought;
    },
    [thoughts, saveThoughtsToFile],
  );

  const updateThought = useCallback(
    async (id: string, text: string) => {
      const updated = thoughts.map((t) => (t._id === id ? { ...t, text } : t));
      await saveThoughtsToFile(updated);
    },
    [thoughts, saveThoughtsToFile],
  );

  const deleteThought = useCallback(
    async (id: string) => {
      const updated = thoughts.filter((t) => t._id !== id);
      await saveThoughtsToFile(updated);
    },
    [thoughts, saveThoughtsToFile],
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
