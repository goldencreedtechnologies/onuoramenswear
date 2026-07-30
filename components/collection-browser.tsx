"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { CollectionProductCard } from "@/components/collection-product-card";
import type { PhaseOneCollectionProduct } from "@/data/phase-one-collections";

type CollectionSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  products: PhaseOneCollectionProduct[];
};

function productPrice(product: PhaseOneCollectionProduct) {
  return product.prices.USD;
}

function sortProducts(products: PhaseOneCollectionProduct[], sort: string) {
  return [...products].sort((a, b) => {
    if (sort === "price-asc") return productPrice(a) - productPrice(b);
    if (sort === "price-desc") return productPrice(b) - productPrice(a);
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });
}

export function CollectionBrowser({ sections }: { sections: CollectionSection[] }) {
  const railRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [sort, setSort] = useState("featured");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const colors = useMemo(
    () =>
      Array.from(
        new Map(
          sections
            .flatMap((section) => section.products)
            .map((product) => [product.color, product.colorValue] as const)
        )
      ),
    [sections]
  );

  const visibleSections = useMemo(
    () =>
      sections
        .filter((section) => selectedCollection === "all" || section.id === selectedCollection)
        .map((section) => ({
          ...section,
          products: sortProducts(
            section.products.filter(
              (product) => selectedColor === "all" || product.color === selectedColor
            ),
            sort
          )
        }))
        .filter((section) => section.products.length),
    [sections, selectedCollection, selectedColor, sort]
  );

  const visibleProductCount = visibleSections.reduce(
    (total, section) => total + section.products.length,
    0
  );

  function changeCollection(id: string) {
    setSelectedCollection(id);
    requestAnimationFrame(() => {
      Object.values(railRefs.current).forEach((rail) =>
        rail?.scrollTo({ left: 0, behavior: "smooth" })
      );
    });
  }

  function moveRail(sectionId: string, direction: -1 | 1) {
    const rail = railRefs.current[sectionId];
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.max(280, rail.clientWidth * 0.82),
      behavior: "smooth"
    });
  }

  return (
    <>
      <div className="sticky top-[104px] z-20 border-y border-line bg-page/95 backdrop-blur-xl">
        <div className="container-luxe flex flex-col sm:min-h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <nav
            className="hide-scrollbar flex min-w-0 gap-5 overflow-x-auto border-b border-line sm:border-b-0"
            aria-label="Collections"
          >
            <button
              type="button"
              onClick={() => changeCollection("all")}
              className={`gold-focus shrink-0 border-b-2 py-4 text-[10px] font-semibold uppercase transition sm:py-5 ${
                selectedCollection === "all"
                  ? "border-copy text-copy"
                  : "border-transparent text-copy-muted hover:text-copy"
              }`}
              aria-current={selectedCollection === "all" ? "page" : undefined}
            >
              All
            </button>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => changeCollection(section.id)}
                className={`gold-focus shrink-0 border-b-2 py-4 text-[10px] font-semibold uppercase transition sm:py-5 ${
                  selectedCollection === section.id
                    ? "border-copy text-copy"
                    : "border-transparent text-copy-muted hover:text-copy"
                }`}
                aria-current={selectedCollection === section.id ? "page" : undefined}
              >
                {section.title}
              </button>
            ))}
          </nav>
          <div className="grid shrink-0 grid-cols-2 items-center sm:flex sm:gap-1">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="gold-focus inline-flex h-11 items-center justify-center gap-2 px-3 text-[10px] font-semibold uppercase text-copy transition hover:bg-surface-subtle sm:h-10"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {selectedColor !== "all" ? <span className="h-1.5 w-1.5 rounded-full bg-gold" /> : null}
            </button>
            <label className="sr-only" htmlFor="collection-sort">
              Sort collection
            </label>
            <select
              id="collection-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="gold-focus h-11 w-full bg-transparent px-3 text-[10px] font-semibold uppercase text-copy outline-none sm:h-10 sm:w-auto"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low To High</option>
              <option value="price-desc">Price: High To Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      <section className="overflow-hidden py-9 md:py-12" aria-labelledby="collection-browser-title">
        <div className="container-luxe">
          <header className="mb-9">
            <p className="text-[10px] font-semibold uppercase text-gold">
              {visibleProductCount} {visibleProductCount === 1 ? "Style" : "Styles"}
            </p>
            <h2 id="collection-browser-title" className="mt-2 text-2xl font-semibold md:text-3xl">
              {selectedCollection === "all"
                ? "The Permanent Collections"
                : sections.find((section) => section.id === selectedCollection)?.title}
            </h2>
          </header>

          {visibleSections.length ? (
            <div className="grid gap-12 md:gap-16">
              {visibleSections.map((section, sectionIndex) => (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                  <header className="mb-6 flex items-end justify-between gap-6">
                    <div className="max-w-2xl">
                      <p className="text-[10px] font-semibold uppercase text-gold">
                        {section.eyebrow}
                      </p>
                      <h3 id={`${section.id}-title`} className="mt-2 text-2xl font-semibold">
                        {section.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-copy-muted">{section.description}</p>
                    </div>
                    <div className="hidden shrink-0 gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() => moveRail(section.id, -1)}
                        className="gold-focus grid h-10 w-10 place-items-center border border-line text-copy transition hover:border-copy hover:bg-copy hover:text-white"
                        aria-label={`Scroll ${section.title} products left`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRail(section.id, 1)}
                        className="gold-focus grid h-10 w-10 place-items-center border border-line text-copy transition hover:border-copy hover:bg-copy hover:text-white"
                        aria-label={`Scroll ${section.title} products right`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </header>

                  <div
                    ref={(node) => {
                      railRefs.current[section.id] = node;
                    }}
                    className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-4 sm:gap-5"
                  >
                    {section.products.map((product, index) => (
                      <div
                        key={product.id}
                        className="min-w-0 shrink-0 basis-[78vw] snap-start sm:basis-[42vw] md:basis-[calc((100%-2.5rem)/3)] lg:basis-[calc((100%-3.75rem)/4)]"
                      >
                        <CollectionProductCard
                          product={product}
                          priority={sectionIndex === 0 && index < 4}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="border-y border-line py-16 text-center">
              <p className="text-sm text-copy-muted">No styles match this filter.</p>
              <button
                type="button"
                onClick={() => setSelectedColor("all")}
                className="gold-focus mt-4 text-xs font-semibold uppercase text-copy underline underline-offset-4"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <aside
            className="absolute inset-y-0 right-0 w-full max-w-sm bg-page p-6 text-copy shadow-2xl"
            aria-label="Collection filters"
          >
            <div className="flex items-center justify-between border-b border-line pb-5">
              <h2 className="text-sm font-semibold uppercase">Filter</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="gold-focus flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-subtle"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <fieldset className="mt-7">
              <legend className="text-xs font-semibold uppercase">Colour</legend>
              <div className="mt-4 grid gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedColor("all")}
                  className={`gold-focus flex min-h-12 items-center justify-between border-b border-line text-left text-sm ${
                    selectedColor === "all" ? "font-semibold" : ""
                  }`}
                >
                  All Colours
                  {selectedColor === "all" ? <span className="text-gold">Selected</span> : null}
                </button>
                {colors.map(([name, value]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedColor(name)}
                    className={`gold-focus flex min-h-12 items-center justify-between border-b border-line text-left text-sm ${
                      selectedColor === name ? "font-semibold" : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full border border-copy/15"
                        style={{ backgroundColor: value }}
                      />
                      {name}
                    </span>
                    {selectedColor === name ? <span className="text-gold">Selected</span> : null}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="absolute inset-x-6 bottom-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedColor("all")}
                className="gold-focus h-12 border border-line text-xs font-semibold uppercase hover:border-copy"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="gold-focus h-12 bg-obsidian text-xs font-semibold uppercase text-ivory hover:bg-gold hover:text-obsidian"
              >
                View {visibleProductCount}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
