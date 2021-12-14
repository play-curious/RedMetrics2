import React from "react";

import ReactPaginate from "react-paginate";

import Wrapper from "./Wrapper";

import "./Paginator.scss";

export default function Paginator<T>({
  pageCount,
  fetchPageItems,
}: {
  pageCount: number;
  fetchPageItems: (pageIndex: number) => Promise<T[]>;
}) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageItems, setPageItems] = React.useState<T[]>();

  if (pageItems === undefined)
    fetchPageItems(pageIndex).then(setPageItems).catch(console.error);

  React.useEffect(() => {
    fetchPageItems(pageIndex).then(setPageItems).catch(console.error);
  }, [pageIndex, fetchPageItems]);

  return (
    <div className="paginator">
      <Wrapper>{pageItems}</Wrapper>
      <ReactPaginate
        pageCount={pageCount}
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
