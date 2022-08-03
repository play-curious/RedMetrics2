import React from "react";

import ReactPaginate from "react-paginate";

import Wrapper from "./Wrapper";
import Warn from "./Warn";

import type * as utils from "../utils";

import "./Paginator.scss";
import SortBy from "./SortBy";

export default function Paginator<T>({
  map,
  context,
  onPageChange,
}: {
  map: (item: T, index: number, base: T[]) => any;
  context?: { data: T[]; headers: utils.ResolvedPagingHeaders };
  onPageChange: (
    pageNumber: number,
    sortBy: `${string} ${"asc" | "desc"}`
  ) => unknown;
}) {
  const [sortBy, setSortBy] = React.useState<`${string} ${"asc" | "desc"}`>(
    `updated_timestamp desc`
  );
  const [pageNumber, setPageNumber] = React.useState<number>(1);

  return context && context.data.length > 0 ? (
    <div className="paginator">
      <ReactPaginate
        forcePage={context.headers.pageNumber - 1}
        pageCount={context.headers.pageCount}
        onPageChange={({ selected }) => {
          setPageNumber(selected + 1);
          onPageChange(selected + 1, sortBy);
        }}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        containerClassName="flex w-full justify-center my-5"
        pageLinkClassName="cursor-pointer hover:bg-gray-200 px-2 rounded-full no-underline hover:no-underline"
        activeClassName="border-2 bg-gray-200 rounded-full no-underline hover:no-underline"
        disabledClassName="opacity-50 no-underline hover:no-underline"
      />
      <div className="w-full">
        <SortBy
          row={context.data[0]}
          onChange={(_sortBy) => {
            setSortBy(_sortBy);
            onPageChange(pageNumber, _sortBy);
          }}
        />
      </div>
      <Wrapper>{context.data.map(map)}</Wrapper>
      <ReactPaginate
        forcePage={context.headers.pageNumber - 1}
        pageCount={context.headers.pageCount}
        onPageChange={({ selected }) => {
          setPageNumber(selected + 1);
          onPageChange(selected + 1, sortBy);
        }}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        containerClassName="flex w-full justify-center my-5"
        pageLinkClassName="cursor-pointer hover:bg-gray-200 px-2 rounded-full no-underline hover:no-underline"
        activeClassName="border-2 bg-gray-200 rounded-full no-underline hover:no-underline"
        disabledClassName="opacity-50 no-underline hover:no-underline"
      />
    </div>
  ) : (
    <Warn type="warn"> No data found </Warn>
  );
}
