import { Index } from 'flexsearch';
import * as Guidebook from 'react-guidebook';
import guidebook from '../../guidebook';

let searchDocuments: any[] = [];
let searchIndexPromise: any = undefined;

export const searchPages = (query: string) => {
  if (!searchIndexPromise) {
    searchIndexPromise = Promise.all([
      import('../../searchIndex'),
      import('flexsearch'),
    ]).then(([index, { default: FlexSearch }]) => {
      const { indexData, documents } = index as any;
      searchDocuments = documents;
      const search = new FlexSearch();
      (search as any).import(indexData);
      return search;
    });
  }

  return searchIndexPromise.then((searchIndex: Index<number>) =>
    Guidebook.searchPages(guidebook, searchIndex, searchDocuments, query),
  );
};

export const searchTextMatch = (id: number, query: string) =>
  Guidebook.searchTextMatch(guidebook, searchDocuments, id, query);
