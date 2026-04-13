import { LocalThought, useLocalStorage } from "@/hooks/useLocalStorage";

export type Thought = LocalThought;

export const useThoughts = () => {
  // Use local storage exclusively
  const localStorage = useLocalStorage();

  return {
    thoughts: localStorage.thoughts,
    isLoading: localStorage.isLoading,
    addThought: localStorage.addThought,
    updateThought: localStorage.updateThought,
    deleteThought: localStorage.deleteThought,
    deleteAllThoughts: localStorage.deleteAllThoughts,
    folderPath: localStorage.folderPath,
    selectFolder: localStorage.selectFolder,
    currentDateFile: localStorage.currentDateFile,
    reloadThoughts: localStorage.reloadThoughts,
  };
};
