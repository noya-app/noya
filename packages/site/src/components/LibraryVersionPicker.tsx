import { Select } from 'noya-designsystem';
import React, { useMemo, useState } from 'react';

interface Props {
  libraryName: string;
  version: string;
  onChange: (version: string) => void;
}

export function LibraryVersionPicker({
  libraryName,
  version,
  onChange,
}: Props) {
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);

  const options = useMemo(() => {
    let versions = [...availableVersions];

    if (!versions.includes(version)) {
      versions.unshift(version);
    }

    if (!versions.includes('latest')) {
      versions.unshift('latest');
    }

    return versions;
  }, [availableVersions, version]);

  useMemo(() => {
    fetchAvailableVersions(libraryName).then(setAvailableVersions);
  }, [libraryName]);

  return (
    <Select<string>
      id="select-version"
      value={version}
      onChange={onChange}
      options={options}
      getTitle={(version) => {
        if (version !== 'latest' && !availableVersions.includes(version)) {
          return `${version}*`;
        }

        return version;
      }}
    />
  );
}

async function fetchAvailableVersions(libraryName: string) {
  if (libraryName === 'vanilla' || libraryName === 'thumbnail') return [];

  const response = await fetch(`https://registry.npmjs.org/${libraryName}`);
  const data = await response.json();
  const versions = Object.keys(data.versions);

  // Sort with newest versions first
  versions.sort((a, b) => {
    const aDate = new Date(data.time[a]);
    const bDate = new Date(data.time[b]);

    return bDate.getTime() - aDate.getTime();
  });

  return versions;
}
