import { useRef, useState } from 'react';
import { FileExt, FileOrDirectory, openDirectory } from './workWithFileSystem';
import {EmbeddingPipelineSingleton, VectorDbSingleton } from './singletons';
import './App.css';

const extractor = await EmbeddingPipelineSingleton.getInstance();
const vectorStore = await VectorDbSingleton.getInstance();

const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substr(2);
  return dateString + randomness;
};

function App() {
  const [output, setOutput] = useState<(FileExt | FileOrDirectory)[]>([]);
  const searchTermRef = useRef<HTMLInputElement | null>(null);
  const [searchResults, setSearchResults] = useState<(string | File | undefined)[]>([]);

  const handleButtonClick = async () => {
    const out = await openDirectory();
    console.log(out);
    setOutput(out);
  };

  const handleVectorizeandSave = async () => {
    const content = "My content!";
    const tags = ["these", "are", "tags"];
    const data = await extractor(content, { pooling: 'mean', normalize: true });
    const embedding = new Float64Array(data.data);
    console.log({ embedding })
    await vectorStore.insert(content, embedding, tags);
    const result = await vectorStore.search(embedding, undefined,1000);
    console.log(result);
  }

  const handleSearch = async () => {
    if (searchTermRef?.current === null) {
      console.error('searchTermRef is null');
      return;
    }
    try {
      const searchValue: string = searchTermRef?.current?.value;
      const output = await extractor(searchValue, { pooling: 'mean', normalize: true });
      const outputData = new Float64Array(output.data);
      console.log({ searchValue })
      const result = await vectorStore.search(outputData, undefined, 1000);
      console.log({ result });
      setSearchResults(result);
    } catch (err) {
      console.error(err);
    }
  }

  const handleClear = async () => {
    await vectorStore.clear();
  }


  return (
    <div className="app-container">
    <div className="actions-container">
      <button className="action-button" onClick={handleButtonClick}>
        Open Directory
      </button>
      <button className="action-button" onClick={handleVectorizeandSave}>
        Vectorize and Save
      </button>
      <button className="action-button" onClick={handleClear}>
        Clear
      </button>
    </div>
    <div className="search-container">
      <input
        className="search-input"
        ref={searchTermRef}
        type="text"
        placeholder="Search..."
      />
      <button className="search-button" onClick={handleSearch}>
        Search
      </button>
    </div>
    <div className="output-container">
      <h2>Files and Directories:</h2>
      {output.map((fileOrDir) => {
        if (fileOrDir instanceof File) {
          return (
            <div key={uniqueId()} className="file-item">
              {fileOrDir.name}
            </div>
          );
        } else {
          return (
            <div key={uniqueId()} className="directory-item">
              {Object.keys(fileOrDir).map((data: any) => {
                return (
                  <div key={uniqueId()} className="directory-content">
                    {data.text}
                  </div>
                );
              })}
            </div>
          );
        }
      })}
    </div>
    <div className="search-results-container">
      <h2>Search Results:</h2>
      {searchResults.map((result: any) => {
        return (
          <div key={uniqueId()} className="search-result-item">
            <div className="search-result-similarity">{result.similarity}</div>
            <div className="search-result-content">{result.content}</div>
          </div>
        );
      })}
    </div>
  </div>
  );
}

export default App;