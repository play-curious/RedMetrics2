import React from "react";

import ReactPaginate from "react-paginate";

import Wrapper from "./Wrapper";

import type * as utils from "../utils";

import "./Paginator.scss";

export default function Paginator<T>({
  map,
  headers,
  pageItems,
  onPageChange,
}: {
  map: (item: T, index: number, base: T[]) => any;
  headers: utils.ResolvedPagingHeaders;
  pageItems: T[];
  onPageChange: (pageNumber: number) => unknown;
}) {
  const [pageIndex, setPageIndex] = React.useState(0);

  React.useEffect(() => {
    onPageChange(pageIndex + 1);
  }, [pageIndex, onPageChange]);

  return (
    <div className="paginator">
      <ReactPaginate
        forcePage={pageIndex}
        pageCount={headers.pageCount}
        onPageChange={({ selected }) => {
          setPageIndex(selected);
        }}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        containerClassName="flex w-full justify-center my-5"
        pageLinkClassName="cursor-pointer hover:bg-gray-200 px-2 rounded-full no-underline hover:no-underline"
        activeClassName="border-2 bg-gray-200 rounded-full no-underline hover:no-underline"
        disabledClassName="opacity-50 no-underline hover:no-underline"
      />
      <Wrapper>{pageItems.map(map)}</Wrapper>
      <ReactPaginate
        forcePage={pageIndex}
        pageCount={headers.pageCount ?? 0}
        onPageChange={({ selected }) => {
          setPageIndex(selected);
        }}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        containerClassName="flex w-full justify-center my-5"
        pageLinkClassName="cursor-pointer hover:bg-gray-200 px-2 rounded-full no-underline hover:no-underline"
        activeClassName="border-2 bg-gray-200 rounded-full no-underline hover:no-underline"
        disabledClassName="opacity-50 no-underline hover:no-underline"
      />
    </div>
  );
}
