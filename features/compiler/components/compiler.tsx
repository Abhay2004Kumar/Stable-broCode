'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { languages } from '../lib/judge0';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type * as monaco from 'monaco-editor';
import { defaultCodeSnippets } from '../lib/default-code';


// Define the language configuration mapping
const languageConfig = {
  'C++ (GCC 11.2.0)': 'cpp',
  'C (GCC 11.2.0)': 'c',
  'Python (3.11.2)': 'python',
  'JavaScript (Node.js 20.1.0)': 'javascript',
  'Java (OpenJDK 17.0.2)': 'java',
  'Go (1.20.1)': 'go',
  'Rust (1.70.0)': 'rust'
};

export function OnlineCompiler() {
  const [code, setCode] = useState<string>('');
  const [languageId, setLanguageId] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set default language after component mounts
  useEffect(() => {
    if (languages.length > 0 && !selectedLanguage) {
      const defaultLang = languages[0].name;
      setSelectedLanguage(defaultLang);
      setLanguageId(languages[0].id);
    }
  }, [selectedLanguage]);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (value: string) => {
    const lang = languages.find(l => l.name === value);
    if (lang) {
      setSelectedLanguage(value);
      setLanguageId(lang.id);
      setCode(defaultCodeSnippets[value] || '');
      setOutput('');  
      setStdin('');
    }
  };
  
  const handleRun = async () => {
    if (languageId === null || !editorRef.current) return;
    
    try {
      setIsLoading(true);
      setOutput('Running...');
      
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCode: editorRef.current.getValue(),
          languageId,
          stdin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const result = await response.json();
      
      if (result.compile_output) {
        setOutput(`Compilation Error:\n${result.compile_output}`);
      } else if (result.stderr) {
        setOutput(`Runtime Error:\n${result.stderr}`);
      } else {
        setOutput(result.stdout || 'No output');
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything on the server
  if (!isClient) {
    return null;
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Online Compiler</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select
            value={selectedLanguage}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.name}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleRun} 
            disabled={isLoading || languageId === null}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Code Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px]">
            <Editor
              height="100%"
              defaultLanguage={languageConfig[selectedLanguage as keyof typeof languageConfig] || 'plaintext'}
              language={languageConfig[selectedLanguage as keyof typeof languageConfig] || 'plaintext'}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 h-full">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md h-[200px] overflow-auto whitespace-pre-wrap">
                {output}
              </pre>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Input (stdin)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-full min-h-[150px] p-2 bg-background border rounded-md font-mono text-sm"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input (if needed)"
                spellCheck={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}