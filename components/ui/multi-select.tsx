"use client";


import { useEffect, useState } from 'react';
import Select from 'react-select';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
}
const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  onChange,
  value
}) => {
  const [isMounted, setIsMounted] = useState(false);
  console.log(value)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  };

  if (!isMounted) {
    return null;
  }

  const handleChange = (selectedOption: any) => {
    onChange(selectedOption)
  }

  return ( 
    <div>
        <Select
            id="categories"
            inputId="categories-select"
            isMulti
            value={value}
            options={value}
            onChange={handleChange}
            className="w-full"
          />
    </div>
  );
}
 
export default MultiSelect;