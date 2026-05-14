/**
 * Codellama Component
 * -------------------
 *
 * What it does:
 *  - Provides an interactive chat interface for code generation and assistance using an AI backend (Ollama).
 *  - Allows users to send prompts, receive code or text responses, and interact with code blocks.
 *  - Supports code block extraction, language detection, and file generation from AI responses.
 *  - Features a Monaco-based code editor with multi-tab support for editing generated or uploaded files.
 *  - Lets users upload folders, browse a virtual file system, and save generated files to folders.
 *  - Maintains chat history and allows users to revisit previous prompts.
 *
 * Where it is used:
 *  - Registered as a route in `src/App.tsx` at path `/codellama`.
 *  - Can be navigated to from the Dashboard (see `handleTryAI` in `Dashboard.tsx`).
 *  - Used as a standalone AI code assistant and editor page in your application.
 *
 * Parameters:
 *  - None (this component does not accept any props).
 *
 * Returns:
 *  - JSX.Element
 *      The rendered UI, including:
 *        - A chat interface for interacting with the AI.
 *        - A code editor with tabbed file editing.
 *        - File system and generated file management panels.
 *        - Dialogs for saving files and managing folders.
 */
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ClipboardCopy, Eye, EyeOff, Code, History, Folder, File, ChevronRight, ChevronDown, Save, MessageSquare, FileCode,Plus,X } from 'lucide-react';
import { Editor } from "@monaco-editor/react";

let context: Array<number>;


// Tab interface definition
interface EditorTab {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  language: string;
  isModified: boolean;
}

// Function to detect language from markdown code block
const detectLanguage = (codeBlock: string): string => {
  // Match triple backtick syntax (e.g., ```js, ```python, ```css, etc.)
  let match = codeBlock.match(/```(\w+)/);
  if (match) {
    return match[1].toLowerCase();
  }

  // Match comment-based hints (e.g., /* CSS code */, // JavaScript code)
  match =
    codeBlock.match(/\/\* *(\w+) code *\*\//i) || // /* Python code */
    codeBlock.match(/\/\/ *(\w+) code/i) || // // JavaScript code
    codeBlock.match(/\/\* *CSS *\*\//i); // /* CSS */

  if (match) {
    return match[1].toLowerCase();
  }

  return '';
};


// Function to get appropriate file extension
const getFileExtension = (language: string): string => {
  const extensionMap: {[key: string]: string} = {
    'javascript': '.js',
    'js': '.js',
    'typescript': '.ts',
    'ts': '.ts',
    'tsx': '.tsx',
    'jsx': '.jsx',
    'css': '.css',
    'html': '.html',
    'python': '.py',
    'py': '.py',
    'java': '.java',
    'c': '.c',
    'cpp': '.cpp',
    'c++': '.cpp',
    'csharp': '.cs',
    'cs': '.cs',
    'php': '.php',
    'ruby': '.rb',
    'rb': '.rb',
    'rust': '.rs',
    'go': '.go',
    'swift': '.swift',
    'kotlin': '.kt',
  };
  
  return extensionMap[language] || '.tsx';
};

// Function to extract filename from code comments
const extractFilename = (code: string): string | null => {
  // Match patterns like "// filename.tsx" or "// filename.js"
  const filenameMatch = code.trim().match(/^\/\/\s+([a-zA-Z0-9_-]+\.[a-zA-Z0-9]+)/);
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1];
  }
  return null;
};

// Type for file system structure
interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileSystemItem[];
  content?: string;
  isOpen?: boolean;
}

// Save file dialog component
interface SaveFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderPath: string) => void;
  fileSystem: FileSystemItem[];
}

const SaveFileDialog: React.FC<SaveFileDialogProps> = ({ isOpen, onClose, onSave, fileSystem }) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Recursive function to render folders only
  const renderFolders = (items: FileSystemItem[], level = 0) => {
    return items.map((item, index) => {
      if (item.type === 'folder') {
        return (
          <div key={`${item.path}-${index}`}>
            <div 
              className={`d-flex align-items-center py-1 px-2 rounded hover-bg-secondary ${selectedFolder === item.path ? 'bg-primary' : ''}`}
              style={{ 
                cursor: "pointer", 
                marginLeft: `${level * 12}px` 
              }}
              onClick={() => setSelectedFolder(item.path)}
            >
              <Folder size={16} className="me-2" />
              <span>{item.name}</span>
            </div>
            {item.children && renderFolders(item.children, level + 1)}
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  if (!isOpen) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
      <div className="bg-dark text-white rounded p-4" style={{ width: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h5 className="mb-3">Select a folder to save the file</h5>
        <div className="mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {fileSystem.length > 0 ? renderFolders(fileSystem) : <p>No folders available</p>}
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => selectedFolder && onSave(selectedFolder)}
            disabled={!selectedFolder}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom component to render code blocks with copy button
const CodeBlock: React.FC<{ children: string, language: string, index: number, onAddToEditor: (code: string, language: string) => void }> = ({ children, language, index, onAddToEditor }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const isCodeCopied = copiedIndex === index;
  const code = children.replace(/```[\w]*\n?|```$/g, '');
  const detectedLanguage = language || detectLanguage(children) || 'typescript';
  
  const handleAddToEditor = () => {
    onAddToEditor(code, detectedLanguage);
  };
  
  return (
    <div className="position-relative">
      <pre className="bg-dark rounded p-4 my-2">
        <code className="small">{code}</code>
        <div className="position-absolute top-0 end-0 mt-2 me-2 d-flex gap-2">
          <CopyToClipboard
            text={code}
            onCopy={() => {
              setCopiedIndex(index);
              setTimeout(() => setCopiedIndex(null), 2000);
            }}
          >
            <button className="btn btn-sm btn-secondary">
              <ClipboardCopy size={16} />
              <span className="ms-1">{isCodeCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </CopyToClipboard>
          <button 
            className="btn btn-sm btn-primary"
            onClick={handleAddToEditor}
          >
            <Code size={16} />
            <span className="ms-1">Add to Editor</span>
          </button>
        </div>
      </pre>
    </div>
  );
};

const Codellama: React.FC = () => {
  const [input, setInput] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const focusTargetRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // File system state
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [currentFilePath, setCurrentFilePath] = useState("");
  
  // Generated files state
  const [generatedFiles, setGeneratedFiles] = useState<FileSystemItem[]>([]);
  const [generatedFileCounter, setGeneratedFileCounter] = useState(1);
  
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Added: Tab state management
  const [activeTab, setActiveTab] = useState<'editor' | 'chat'>('editor');

    // Editor tabs state
  const [editorTabs, setEditorTabs] = useState<EditorTab[]>([]);
  const [activeEditorTab, setActiveEditorTab] = useState<string | null>(null);

  // Save file dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileToSave, setFileToSave] = useState<FileSystemItem | null>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleFolderUpload = async (event: any) => {
    const fileHandles = event.target.files;
    if (!fileHandles || fileHandles.length === 0) return;
    
    // Process files and build file system structure
    const newFileSystem: FileSystemItem[] = [];
    const folderPaths = new Set<string>();
    
    // First pass: collect all folder paths
    for (let i = 0; i < fileHandles.length; i++) {
      const file = fileHandles[i];
      const path = file.webkitRelativePath || file.name;
      const parts = path.split('/');
      
      // Add all folder paths
      let currentPath = '';
      for (let j = 0; j < parts.length - 1; j++) {
        currentPath += (j > 0 ? '/' : '') + parts[j];
        folderPaths.add(currentPath);
      }
    }
    
    // Create folder structure
    const folders: {[key: string]: FileSystemItem} = {};
    folderPaths.forEach(path => {
      const parts = path.split('/');
      const folderName = parts[parts.length - 1];
      folders[path] = {
        name: folderName,
        type: 'folder',
        path: path,
        children: [],
        isOpen: false
      };
    });
    
    // Add root folders to file system
    folderPaths.forEach(path => {
      const parts = path.split('/');
      if (parts.length === 1) {
        newFileSystem.push(folders[path]);
      } else {
        const parentPath = parts.slice(0, parts.length - 1).join('/');
        if (folders[parentPath]) {
          folders[parentPath].children?.push(folders[path]);
        }
      }
    });
    
    // Second pass: add files to their folders
    for (let i = 0; i < fileHandles.length; i++) {
      const file = fileHandles[i];
      const path = file.webkitRelativePath || file.name;
      const parts = path.split('/');
      const fileName = parts[parts.length - 1];
      
      if (parts.length === 1) {
        // Root file
        newFileSystem.push({
          name: fileName,
          type: 'file',
          path: path,
          content: await file.text()
        });
      } else {
        // File in folder
        const parentPath = parts.slice(0, parts.length - 1).join('/');
        if (folders[parentPath]) {
          folders[parentPath].children?.push({
            name: fileName,
            type: 'file',
            path: path,
            content: await file.text()
          });
        }
      }
    }
    
    setFileSystem(newFileSystem);
  };

  const toggleFolder = (path: string) => {
    // Helper function to recursively update folder state
    const updateFolderState = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(item => {
        if (item.path === path && item.type === 'folder') {
          return { ...item, isOpen: !item.isOpen };
        } else if (item.children) {
          return { ...item, children: updateFolderState(item.children) };
        }
        return item;
      });
    };
    
    setFileSystem(updateFolderState(fileSystem));
    setGeneratedFiles(updateFolderState(generatedFiles));
  };

  const openFileInTab = (item: FileSystemItem) => {
    if (item.type !== 'file') return;
    
    // Generate a unique ID for the tab
    const tabId = `tab-${Date.now()}`;
    
    // Check if file is already open in a tab
    const existingTabIndex = editorTabs.findIndex(tab => tab.filePath === item.path);
    
    if (existingTabIndex >= 0) {
      // File is already open, just activate that tab
      setActiveEditorTab(editorTabs[existingTabIndex].id);
    } else {
      // Create a new tab for this file
      const fileExt = item.path.split('.').pop()?.toLowerCase() || '';
      const language = getEditorLanguage(item.path);
      
      const newTab: EditorTab = {
        id: tabId,
        filePath: item.path,
        fileName: item.name,
        content: item.content || '',
        language: language,
        isModified: false
      };
      
      setEditorTabs([...editorTabs, newTab]);
      setActiveEditorTab(tabId);
    }
    
    setSelectedItem(item);
    setCurrentFilePath(item.path);
    setActiveTab('editor');
  };

  // Function to close a tab
  const closeTab = (tabId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Get the tab to close
    const tabIndex = editorTabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;
    
    // If this is the active tab, we need to activate another tab
    if (tabId === activeEditorTab) {
      // Try to activate the tab to the left, or to the right if there's no left tab
      if (tabIndex > 0) {
        setActiveEditorTab(editorTabs[tabIndex - 1].id);
      } else if (tabIndex < editorTabs.length - 1) {
        setActiveEditorTab(editorTabs[tabIndex + 1].id);
      } else {
        // No tabs left
        setActiveEditorTab(null);
        setCurrentFilePath("");
        setFileContent("");
      }
    }
    
    // Remove the tab
    const updatedTabs = editorTabs.filter(tab => tab.id !== tabId);
    setEditorTabs(updatedTabs);
  };

  // Function to update tab content when edited
  const updateTabContent = (content: string) => {
    if (!activeEditorTab) return;
    
    setEditorTabs(editorTabs.map(tab => {
      if (tab.id === activeEditorTab) {
        return { ...tab, content, isModified: true };
      }
      return tab;
    }));
    
    setFileContent(content);
    
    // Also update the file system or generated files content
    // This depends on whether you want changes to be "saved" automatically
    // For now, we'll just mark the tab as modified
  };

  const selectItem = (item: FileSystemItem) => {
    if (item.type === 'file') {
      openFileInTab(item);
      setSelectedItem(item);
      setFileContent(item.content || '');
      setCurrentFilePath(item.path);
      setActiveTab('editor'); // Switch to editor tab when a file is selected
    }
  };

  // Function to save a generated file to the file system
  const saveFileToFolder = (folderPath: string) => {
    if (!fileToSave) return;
  
    // Helper function to find the folder and add the file virtually
    const addFileToFolder = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(item => {
        if (item.path === folderPath && item.type === 'folder') {
          // Add the file to this folder in virtual file system
          const updatedChildren: FileSystemItem[] = [...(item.children || []), {
            name: fileToSave.name,
            type: 'file',
            path: `${folderPath}/${fileToSave.name}`,
            content: fileToSave.content
          }];
          return { ...item, children: updatedChildren };
        } else if (item.children) {
          return { ...item, children: addFileToFolder(item.children) };
        }
        return item;
      });
    };
  
    // Update the virtual file system
    const updatedFileSystem = addFileToFolder(fileSystem);
    setFileSystem(updatedFileSystem);
  
    // Find the folder where we're saving the file
    const findFolder = (items: FileSystemItem[]): FileSystemItem | undefined => {
      for (const item of items) {
        if (item.path === folderPath) return item;
        if (item.children) {
          const found = findFolder(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
  
    const folder = findFolder(updatedFileSystem);
    
    // Download the file physically
    downloadFile(fileToSave);
  
    // Reset state
    setShowSaveDialog(false);
    setFileToSave(null);
  };
  
  async function downloadFile(file: FileSystemItem, folder?: FileSystemDirectoryHandle) {
    try {
        let dirHandle: FileSystemDirectoryHandle;

        // If a valid folder handle is provided, use it. Otherwise, ask the user.
        if (folder) {
            dirHandle = folder;
        } else {
            dirHandle = await window.showDirectoryPicker();
            if (!dirHandle) {
                console.error("No folder selected.");
                return;
            }
        }

        // Create or get the file inside the selected folder
        const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();

        // Write file content
        const blob = new Blob([file.content ?? ""], { type: "text/plain" });
        await writable.write(blob);
        await writable.close();

        console.log(`File downloaded successfully to: ${dirHandle.name}/${file.name}`);
    } catch (error) {
        console.error("Error downloading file:", error);
    }
  }

  // Function to extract code from responses
  const extractCodeBlocks = (response: string): {code: string, language: string}[] => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    const codeBlocks = [];
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const language = match[1].toLowerCase() || 'text';
      const code = match[2];
      codeBlocks.push({ code, language });
    }
    
    return codeBlocks;
  };

  useEffect(() => {
    if (chatContainerRef.current && activeTab === 'chat') {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [responses, activeTab]);

  useEffect(() => {
    if (activeEditorTab) {
      const tab = editorTabs.find(tab => tab.id === activeEditorTab);
      if (tab) {
        setFileContent(tab.content);
        setCurrentFilePath(tab.filePath);
      }
    }
  }, [activeEditorTab, editorTabs]);

  const handleAddToEditor = (code: string, language: string) => {
    // Check if the code contains a filename comment
    const extractedFilename = extractFilename(code);
    let fileName;
    
    if (extractedFilename) {
      fileName = extractedFilename;
    } else {
      const fileExt = getFileExtension(language);
      fileName = `generated_${generatedFileCounter}${fileExt}`;
    }
    
    const filePath = `generated/${fileName}`;
    
    const newFile: FileSystemItem = {
      name: fileName,
      type: 'file',
      path: filePath,
      content: code
    };
    
    setGeneratedFiles([...generatedFiles, newFile]);
    setGeneratedFileCounter(generatedFileCounter + 1);
    selectItem(newFile);
  };

  const handleSendMessage = async () => {
    try {
      setHistory([...history, input]);
      setInputDisabled(true);
      
      // Don't clear file system and generated files when sending a message
      const tempResponses = [...responses, input];
      setResponses(tempResponses);
      
      const ollamaResponse = await axios.post('http://localhost:8000/api/ollama', {
        message: input,
        context: context
      });
       if(ollamaResponse.status === 500){
        console.log("Error in ollama response", ollamaResponse.data.error);
       }else if (ollamaResponse.status === 401) {
          window.location.href = 'http://localhost:8000/auth/login'; // Redirect to login page
        } 
      context = ollamaResponse.data.context;
      const responseMessage = ollamaResponse.data.message;
      
      // Update responses with the AI response
      setResponses([...tempResponses, responseMessage]);
      
      // Extract code blocks from the response
      const codeBlocks = extractCodeBlocks(responseMessage);
      
      if (codeBlocks.length > 0) {
        const newGeneratedFiles: FileSystemItem[] = [];
        
        codeBlocks.forEach((block, index) => {
          const language = block.language;
          
          // Check if the code block contains a filename comment
          const extractedFilename = extractFilename(block.code);
          let fileName;
          
          if (extractedFilename) {
            // Use the extracted filename if available
            fileName = extractedFilename;
          } else {
            // Fall back to the default naming with language extension
            const fileExt = getFileExtension(language);
            fileName = `generated_${generatedFileCounter + index}${fileExt}`;
          }
          
          newGeneratedFiles.push({
            name: fileName,
            type: 'file',
            path: `generated/${fileName}`,
            content: block.code
          });
        });
        
        // Update the generated files counter
        setGeneratedFileCounter(generatedFileCounter + codeBlocks.length);
        
        // Add the new generated files to the state
        const updatedGeneratedFiles = [...generatedFiles, ...newGeneratedFiles];
        setGeneratedFiles(updatedGeneratedFiles);
        
        // Select the first generated file to display in the editor
        if (newGeneratedFiles.length > 0) {
          selectItem(newGeneratedFiles[0]);
        }

        // After processing code blocks, switch to chat tab to see the Codellama response
        setActiveTab('chat');
      }
      
      setInput('');
    } catch (error) {
      console.error('Error sending message to Ollama:', error);
    } finally {
      setInputDisabled(false);
      setTimeout(() => {
        if (focusTargetRef.current) {
          focusTargetRef.current.focus();
        }
      }, 1000);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleHistoryClick = (historyItem: string) => {
    setInput(historyItem);
  };

  // Function to determine editor language from file path
  const getEditorLanguage = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const languageMap: {[key: string]: string} = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'css': 'css',
      'html': 'html',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'rs': 'rust',
      'go': 'go',
      'swift': 'swift',
      'kt': 'kotlin',
      'json': 'json',
      'md': 'markdown',
    };
    
    return languageMap[ext] || 'typescript';
  };

  // Function to handle "Add to Code" button click
  const handleAddToCode = (item: FileSystemItem) => {
    setFileToSave(item);
    setShowSaveDialog(true);
  };

  // Recursive function to render the file system
  const renderFileSystem = (items: FileSystemItem[], level = 0) => {
    return items.map((item, index) => (
      <div key={`${item.path}-${index}`} style={{ marginLeft: `${level * 12}px` }}>
        {item.type === 'folder' ? (
          <div>
            <div 
              className="d-flex align-items-center py-1 px-2 rounded hover-bg-secondary"
              style={{ cursor: "pointer" }}
              onClick={() => toggleFolder(item.path)}
            >
              {item.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <Folder size={16} className="ms-1 me-2" />
              <span>{item.name}</span>
            </div>
            {item.isOpen && item.children && renderFileSystem(item.children, level + 1)}
          </div>
        ) : (
          <div 
            className={`d-flex align-items-center py-1 px-2 rounded hover-bg-secondary ${selectedItem?.path === item.path ? 'bg-primary' : ''}`}
            style={{ cursor: "pointer", marginLeft: `${level > 0 ? 20 : 0}px` }}
            onClick={() => selectItem(item)}
          >
            <File size={16} className="me-2" />
            <span>{item.name}</span>
          </div>
        )}
      </div>
    ));
  };

  // Render generated files with "Add to Code" button
  const renderGeneratedFiles = (items: FileSystemItem[], level = 0) => {
    return items.map((item, index) => (
      <div key={`${item.path}-${index}`} style={{ marginLeft: `${level * 12}px` }}>
        {item.type === 'folder' ? (
          <div>
            <div 
              className="d-flex align-items-center py-1 px-2 rounded hover-bg-secondary"
              style={{ cursor: "pointer" }}
              onClick={() => toggleFolder(item.path)}
            >
              {item.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <Folder size={16} className="ms-1 me-2" />
              <span>{item.name}</span>
            </div>
            {item.isOpen && item.children && renderGeneratedFiles(item.children, level + 1)}
          </div>
        ) : (
          <div className="d-flex flex-column">
            <div 
              className={`d-flex align-items-center py-1 px-2 rounded hover-bg-secondary ${selectedItem?.path === item.path ? 'bg-primary' : ''}`}
              style={{ cursor: "pointer", marginLeft: `${level > 0 ? 20 : 0}px` }}
              onClick={() => selectItem(item)}
            >
              <File size={16} className="me-2" />
              <span>{item.name}</span>
              
              {/* Add to Code button */}
              {fileSystem.length > 0 && (
                <button 
                  className="btn btn-sm btn-outline-secondary ms-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCode(item);
                  }}
                  title="Add to Code"
                >
                  <Save size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    ));
  };

  // Function to render chat messages
  const renderChatMessages = () => {
    return responses.map((message, index) => {
      const isUserMessage = index % 2 === 0;
      const codeBlocks = extractCodeBlocks(message);
      
      if (isUserMessage) {
        return (
          <div key={index} className="bg-secondary rounded p-3 mb-3">
            <div className="fw-bold mb-2">You:</div>
            <div>{message}</div>
          </div>
        );
      } else {
        // Process bot message to render code blocks properly
        const segments = [];
        let lastIndex = 0;
        
        codeBlocks.forEach((block, blockIndex) => {
          const blockStart = message.indexOf('```', lastIndex);
          if (blockStart > lastIndex) {
            segments.push(
              <div key={`text-${blockIndex}`} className="mb-3">
                {message.substring(lastIndex, blockStart)}
              </div>
            );
          }
          
          const blockEnd = message.indexOf('```', blockStart + 3) + 3;
          segments.push(
            <CodeBlock 
              key={`code-${blockIndex}`} 
              language={block.language}
              index={blockIndex}
              onAddToEditor={handleAddToEditor}
            >
              {message.substring(blockStart, blockEnd)}
            </CodeBlock>
          );
          
          lastIndex = blockEnd;
        });
        
        if (lastIndex < message.length) {
          segments.push(
            <div key="text-last" className="mb-3">
              {message.substring(lastIndex)}
            </div>
          );
        }
        
        return (
          <div key={index} className="bg-dark rounded p-3 mb-3 border border-secondary">
            <div className="fw-bold mb-2 text-info">CodeLlama:</div>
            {segments.length > 0 ? segments : <div>{message}</div>}
          </div>
        );
      }
    });
  };

  const renderEditorTabs = () => {
    return (
      <div className="d-flex bg-dark border-bottom border-secondary overflow-auto">
        {editorTabs.map(tab => (
          <div
            key={tab.id}
            className={`d-flex align-items-center px-3 py-2 border-end border-secondary ${activeEditorTab === tab.id ? 'bg-primary' : 'bg-dark text-white'}`}
            style={{ cursor: 'pointer', minWidth: 'fit-content' }}
            onClick={() => setActiveEditorTab(tab.id)}
          >
            <span className="me-2">
              {tab.fileName}{tab.isModified ? ' •' : ''}
            </span>
            <button
              className="btn btn-sm btn-link text-white p-0 d-flex align-items-center justify-content-center"
              style={{ width: '16px', height: '16px' }}
              onClick={(e) => closeTab(tab.id, e)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <div className="px-2 py-2 d-flex align-items-center">
          <button 
            className="btn btn-sm btn-dark d-flex align-items-center justify-content-center"
            title="New File"
            onClick={() => {
              // Create a new untitled file
              const tabId = `tab-${Date.now()}`;
              const fileName = `untitled-${editorTabs.filter(t => t.fileName.startsWith('untitled-')).length + 1}.txt`;
              
              const newTab: EditorTab = {
                id: tabId,
                filePath: fileName,
                fileName: fileName,
                content: '',
                language: 'plaintext',
                isModified: false
              };
              
              setEditorTabs([...editorTabs, newTab]);
              setActiveEditorTab(tabId);
              setCurrentFilePath(fileName);
              setFileContent('');
              setActiveTab('editor');
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-root d-flex flex-column">
      <div className="bg-secondary d-flex justify-content-center p-4">
        <h1 className="text-white h4 mb-0">Ollama Chat</h1>
      </div>
      
      {/* Save File Dialog */}
      <SaveFileDialog 
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={saveFileToFolder}
        fileSystem={fileSystem}
      />
      
      <div className="d-flex flex-grow-1 overflow-hidden">
        <div
          className="bg-dark text-white"
          style={{
            width: "250px",
            padding: "10px",
            borderRight: "1px solid #444",
            overflowY: "auto"
          }}
        >
          <div className="mb-3">
            <input
              type="file"
              onChange={handleFolderUpload}
              className="form-control form-control-sm bg-dark text-white"
              ref={(input) => {
                if (input) {
                  input.setAttribute("webkitdirectory", "true");
                  input.setAttribute("directory", "true");
                }
              }}
            />
          </div>
  
          <h6 className="text-white-50 mb-2">Files</h6>
          {renderFileSystem(fileSystem)}
          
          {generatedFiles.length > 0 && (
            <div className="mt-3">
              <h6 className="text-white-50 mb-2">Generated Files</h6>
              {renderGeneratedFiles(generatedFiles)}
            </div>
          )}
        </div>
        
        <div className="d-flex flex-column flex-grow-1">
          {/* Main Tabs (Editor/Chat) */}
          <div className="bg-dark d-flex border-bottom border-secondary">
            <button 
              className={`btn btn-${activeTab === 'editor' ? 'primary' : 'dark'} border-0 rounded-0 flex-grow-1 d-flex align-items-center justify-content-center gap-2`}
              onClick={() => setActiveTab('editor')}
            >
              <FileCode size={16} />
              <span>Code Editor</span>
            </button>
            <button 
              className={`btn btn-${activeTab === 'chat' ? 'primary' : 'dark'} border-0 rounded-0 flex-grow-1 d-flex align-items-center justify-content-center gap-2`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={16} />
              <span>Chat</span>
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-grow-1 overflow-hidden">
            {activeTab === 'editor' ? (
              <div className="d-flex flex-column h-100">
                {/* Editor Tabs */}
                {renderEditorTabs()}
                
                {/* Editor */}
                <div className="flex-grow-1">
                  {activeEditorTab ? (
                    <Editor
                      height="100%"
                      theme="vs-dark"
                      language={editorTabs.find(tab => tab.id === activeEditorTab)?.language || 'plaintext'}
                      value={fileContent}
                      onChange={(e: any) => updateTabContent(e || "")}
                      onMount={handleEditorDidMount}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-white-50">
                      <div className="text-center">
                        <div className="mb-3">No file open</div>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            // Create a new untitled file
                            const tabId = `tab-${Date.now()}`;
                            const fileName = `untitled-1.txt`;
                            
                            const newTab: EditorTab = {
                              id: tabId,
                              filePath: fileName,
                              fileName: fileName,
                              content: '',
                              language: 'plaintext',
                              isModified: false
                            };
                            
                            setEditorTabs([newTab]);
                            setActiveEditorTab(tabId);
                            setCurrentFilePath(fileName);
                            setFileContent('');
                          }}
                        >
                          <Plus size={16} className="me-2" />
                          New File
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div 
                ref={chatContainerRef}
                className="p-3 overflow-auto h-100 bg-dark text-white"
              >
                {renderChatMessages()}
              </div>
            )}
          </div>
  
          {/* Chat Input & History */}
          <div className="bg-dark border-top border-secondary p-3">
            <div className="d-flex">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => setShowHistory(!showHistory)}
                title={showHistory ? 'Hide History' : 'Show History'}
              >
                <History size={16} />
              </button>
              <textarea
                ref={focusTargetRef}
                className="form-control bg-dark text-white"
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question or request code..."
                disabled={inputDisabled}
              />
              <button
                className="btn btn-primary ms-2"
                onClick={handleSendMessage}
                disabled={inputDisabled || !input.trim()}
              >
                Send
              </button>
            </div>
            
            {/* History Panel */}
            {showHistory && (
              <div className="mt-3 p-2 border border-secondary rounded">
                <h6 className="text-white-50 mb-2">Message History</h6>
                {history.length === 0 ? (
                  <div className="text-muted">No history yet</div>
                ) : (
                  <div className="d-flex flex-column gap-1">
                    {history.map((item, index) => (
                      <div 
                        key={index}
                        className="p-2 rounded bg-secondary bg-opacity-25 text-truncate hover-bg-secondary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleHistoryClick(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Codellama;