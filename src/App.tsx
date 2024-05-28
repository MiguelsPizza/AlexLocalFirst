import { useRef, useState } from 'react';
import { FileExt, FileOrDirectory, openDirectory } from './workWithFileSystem';
import { EmbeddingPipelineSingleton, VectorDbSingleton } from './singletons';
import './App.css';

const extractor = await EmbeddingPipelineSingleton.getInstance();
const vectorStore = await VectorDbSingleton.getInstance();

const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substr(2);
  return dateString + randomness;
};

// type DirectoryObject = {
//   directoryHandle: FileSystemDirectoryHandle;
//   fileExtension: string;
//   handle: FileSystemFileHandle;
//   webkitRelativePath: string;
// };


function App() {
  const [output, setOutput] = useState<(FileExt | FileOrDirectory)[]>([]);
  const searchTermRef = useRef<HTMLInputElement | null>(null);
  const [searchResults, setSearchResults] = useState<(string | File | undefined)[]>([]);
  const [tags, setTags] = useState<{
    fileName: string;
    fileType: ('pdf' | 'txt')[] | null;
  }>({ fileName: '', fileType: null });

  const handleButtonClick = async () => {
    const out = await openDirectory();
    console.log(out);
    setOutput(out);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTags((prevTags) => {
      return {
        ...prevTags,
        [name]: value,
      };
    });
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
      const tagArr = Object.values(tags).flat().filter(Boolean)
      console.log({ tagArr });
      const result = await vectorStore.search(outputData, tagArr.length ? tagArr : undefined, 1000);
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
    <div id='herroword' className="app-container">
      <div className="actions-container">
        <button className="action-button" onClick={handleButtonClick}>
          Open Directory
        </button>
        <div className="tag-container">
          <input
            className="tag-input"
            type="text"
            name="fileName"
            placeholder="File Name"
            onChange={handleTagChange}
          />
          <select
            title='fileType'
            className="tag-select"
            name="fileType"
            onChange={handleTagChange}
          >
            <option value="pdf">PDF</option>
            <option value="txt">TXT</option>
          </select>
        </div>
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
          if (fileOrDir['fileExtension']) {
            return (
              <div key={uniqueId()} className="file-item" onClick={async () => {
                const handle = fileOrDir.handle as FileSystemFileHandle;
                const file = await handle.getFile()
                window.open(URL.createObjectURL(file), '_blank')
              }}>
                {fileOrDir.handle.name}
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