"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { usePlayground as usePlaygroundHook } from "../hooks/usePlayground"
import type { TemplateFolder, TemplateFile } from "../libs/path-to-json"

interface OpenFile extends TemplateFile {
  id: string
  hasUnsavedChanges: boolean
}

interface PlaygroundContextType {
  // From the original hook
  playgroundData: any | null
  templateData: TemplateFolder | null
  isLoading: boolean
  error: string | null
  loadingStep: number
  fetchPlaygroundData: () => Promise<void>
  
  // File management
  activeFileId: string | null
  openFiles: OpenFile[]
  setActiveFileId: (id: string | null) => void
  openFile: (file: TemplateFile) => void
  closeFile: (id: string) => void
  
  // Save functionality
  handleSave: () => void
  handleSaveAll: () => void
  
  // AI suggestions
  suggestion: string | null
  suggestionLoading: boolean
  suggestionPosition: { line: number; column: number } | null
  onAcceptSuggestion: (editor: any, monaco: any) => void
  onRejectSuggestion: (editor: any) => void
  onTriggerSuggestion: (type: string, editor: any) => void
  
  // UI state
  isAISuggestionsEnabled: boolean
  setIsAISuggestionsEnabled: (enabled: boolean) => void
  isPreviewVisible: boolean
  setIsPreviewVisible: (visible: boolean) => void
  isTerminalVisible: boolean
  setIsTerminalVisible: (visible: boolean) => void
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined)

export const usePlayground = () => {
  const context = useContext(PlaygroundContext)
  if (!context) {
    throw new Error("usePlayground must be used within a PlaygroundProvider")
  }
  return context
}

interface PlaygroundProviderProps {
  children: ReactNode
}

export const PlaygroundProvider = ({ children }: PlaygroundProviderProps) => {
  const params = useParams()
  const playgroundId = params?.id as string
  
  // Use the existing hook for core data management
  const {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlayground,
    saveTemplateData,
  } = usePlaygroundHook(playgroundId)

  // Local state for UI and file management
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [loadingStep, setLoadingStep] = useState(0)
  const [isAISuggestionsEnabled, setIsAISuggestionsEnabled] = useState(true)
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [isTerminalVisible, setIsTerminalVisible] = useState(false)

  // AI suggestion state
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState<{ line: number; column: number } | null>(null)

  // Simulate loading steps
  useEffect(() => {
    if (isLoading) {
      setLoadingStep(1)
      const timer1 = setTimeout(() => setLoadingStep(2), 500)
      const timer2 = setTimeout(() => setLoadingStep(3), 1000)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    } else {
      setLoadingStep(3)
    }
  }, [isLoading])

  const openFile = useCallback((file: TemplateFile) => {
    const fileId = `${file.filename}.${file.fileExtension}`
    setOpenFiles(prev => {
      const exists = prev.find(f => f.id === fileId)
      if (exists) {
        setActiveFileId(fileId)
        return prev
      }
      const newFile: OpenFile = {
        ...file,
        id: fileId,
        hasUnsavedChanges: false
      }
      return [...prev, newFile]
    })
    setActiveFileId(fileId)
  }, [])

  const closeFile = useCallback((id: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== id))
    setActiveFileId(prev => prev === id ? null : prev)
  }, [])


  const handleSave = useCallback(async () => {
    if (!activeFileId) return
    
    const activeFile = openFiles.find(f => f.id === activeFileId)
    if (!activeFile || !templateData) return

    try {
      // Update the template data with the new content
      const updatedTemplateData = { ...templateData }
      // This is a simplified update - you might need more complex logic
      // to find and update the file in the nested structure
      
      await saveTemplateData(updatedTemplateData)
      
      // Mark file as saved
      setOpenFiles(prev => prev.map(file => 
        file.id === activeFileId 
          ? { ...file, hasUnsavedChanges: false }
          : file
      ))
      
      toast.success("File saved successfully")
    } catch (error) {
      console.error("Save failed:", error)
      toast.error("Failed to save file")
    }
  }, [activeFileId, openFiles, templateData, saveTemplateData])

  const handleSaveAll = useCallback(async () => {
    const unsavedFiles = openFiles.filter(f => f.hasUnsavedChanges)
    if (unsavedFiles.length === 0) return

    try {
      if (!templateData) return
      
      const updatedTemplateData = { ...templateData }
      await saveTemplateData(updatedTemplateData)
      
      // Mark all files as saved
      setOpenFiles(prev => prev.map(file => ({ ...file, hasUnsavedChanges: false })))
      
      toast.success("All files saved successfully")
    } catch (error) {
      console.error("Save all failed:", error)
      toast.error("Failed to save files")
    }
  }, [openFiles, templateData, saveTemplateData])

  const fetchPlaygroundData = useCallback(async () => {
    await loadPlayground()
  }, [loadPlayground])

  // AI suggestion handlers
  const onAcceptSuggestion = useCallback((editor: any, monaco: any) => {
    console.log("Suggestion accepted")
    setSuggestion(null)
    setSuggestionPosition(null)
    setSuggestionLoading(false)
  }, [])

  const onRejectSuggestion = useCallback((editor: any) => {
    console.log("Suggestion rejected")
    setSuggestion(null)
    setSuggestionPosition(null)
    setSuggestionLoading(false)
  }, [])

  const onTriggerSuggestion = useCallback(async (type: string, editor: any) => {
    if (!isAISuggestionsEnabled || suggestionLoading) return

    console.log("Triggering AI suggestion", { type })
    setSuggestionLoading(true)

    try {
      // Get current cursor position
      const position = editor.getPosition()
      if (!position) return

      // Simulate AI suggestion generation (you can replace this with actual AI API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock suggestion - replace with actual AI integration
      const mockSuggestion = "console.log('AI generated suggestion');"
      
      setSuggestion(mockSuggestion)
      setSuggestionPosition({ line: position.lineNumber, column: position.column })
    } catch (error) {
      console.error("Failed to generate suggestion:", error)
      toast.error("Failed to generate AI suggestion")
    } finally {
      setSuggestionLoading(false)
    }
  }, [isAISuggestionsEnabled, suggestionLoading])

  const contextValue: PlaygroundContextType = {
    // From original hook
    playgroundData,
    templateData,
    isLoading,
    error,
    loadingStep,
    fetchPlaygroundData,
    
    // File management
    activeFileId,
    openFiles,
    setActiveFileId,
    openFile,
    closeFile,
    
    // Save functionality
    handleSave,
    handleSaveAll,
    
    // AI suggestions
    suggestion,
    suggestionLoading,
    suggestionPosition,
    onAcceptSuggestion,
    onRejectSuggestion,
    onTriggerSuggestion,
    
    // UI state
    isAISuggestionsEnabled,
    setIsAISuggestionsEnabled,
    isPreviewVisible,
    setIsPreviewVisible,
    isTerminalVisible,
    setIsTerminalVisible,
  }

  return (
    <PlaygroundContext.Provider value={contextValue}>
      {children}
    </PlaygroundContext.Provider>
  )
}