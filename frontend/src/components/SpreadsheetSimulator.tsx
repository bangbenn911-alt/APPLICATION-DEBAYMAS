import React, { useState } from 'react';

interface Props {
  initialValue?: string;
  onChange: (val: string) => void;
}

export const SpreadsheetSimulator: React.FC<Props> = ({ initialValue = '', onChange }) => {
  const [val, setVal] = useState(initialValue);

  const handleBlur = () => {
    onChange(val);
  };

  return (
    <div className="border rounded-lg overflow-hidden border-gray-300 shadow-inner">
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center gap-2">
        <span className="font-mono text-gray-500 italic text-sm">fx</span>
        <input 
          type="text" 
          className="w-full bg-white border border-gray-300 rounded px-2 py-1 font-mono text-sm outline-none focus:ring-1 focus:ring-primary-600"
          placeholder="e.g. =SUM(100, 200) or =(100-20)/5"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleBlur}
        />
      </div>
      <div className="p-10 bg-white text-center text-gray-400 text-sm">
        Spreadsheet Interface Engine
        <br/>
        Type formula in the fx bar above.
      </div>
    </div>
  );
}
