import { useState, useEffect, useRef, useCallback, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/overlay/command";
import { Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  thumbnail: string;
}

interface ProductSearchClientProps {
  initialProducts: Product[];
  locale?: "en" | "ar";
}

// ✅ Simple translations
const translations = {
  en: {
    search_placeholder: "Search products...",
    productsHeading: "Products",
    noResults: "No results found.",
  },
  ar: {
    search_placeholder: "ابحث عن المنتجات...",
    productsHeading: "المنتجات",
    noResults: "لا توجد نتائج.",
  },
};

export default function ProductSearchClient({
  initialProducts,
  locale = "en",
}: ProductSearchClientProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>(initialProducts);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputWrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const t = translations[locale];
  const isRtl = locale === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  // -------------------------
  // Client-side filtering
  // -------------------------
  const normalize = useCallback(
    (str: string): string =>
      typeof str === "string" ? str.toLowerCase().normalize("NFKD") : "",
    []
  );

  useEffect(() => {
    if (!productQuery) {
      setFilteredProducts(initialProducts);
      return;
    }

    const normalizedQuery = normalize(productQuery);
    setFilteredProducts(
      initialProducts.filter((item) =>
        normalize(item.name).includes(normalizedQuery)
      )
    );
  }, [productQuery, initialProducts, normalize]);

  const handleSelect = (selectedValue: string): void => {
    setDropdownOpen(false);
    setShowMobileSearch(false);
    const selected = initialProducts.find(
      (item) => item.name.toLowerCase() === selectedValue.toLowerCase()
    );
    if (selected?.id) navigate(`/product/${selected.id}`);
  };

  const handleSearch = (): void => {
    if (!productQuery.trim()) return;
    const normalizedQuery = normalize(productQuery.trim());
    const selected = initialProducts.find((item) =>
      normalize(item.name).includes(normalizedQuery)
    );
    if (selected?.id) {
      navigate(`/product/${selected.id}`);
    } else {
      navigate(`/search?query=${encodeURIComponent(productQuery.trim())}`);
    }
    setDropdownOpen(false);
    setShowMobileSearch(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setProductQuery(value);
    setDropdownOpen(!!value.trim());
  };

  const SearchBarContent = (
    <div dir={dir} className='relative w-full z-50' ref={inputWrapperRef}>
      <div className='flex items-center w-full border rounded-full overflow-hidden shadow-sm h-12 sm:h-10 bg-white'>
        <input
          ref={inputRef}
          dir={dir}
          type='text'
          placeholder={t.search_placeholder}
          value={productQuery}
          onFocus={() => productQuery && setDropdownOpen(true)}
          onChange={handleInputChange}
          className={`flex-1 px-2 sm:px-4 text-xs sm:text-sm h-full focus:outline-none ${
            isRtl ? "text-right" : "text-left"
          }`}
          autoFocus={showMobileSearch}
        />
        <button
          type='button'
          onClick={handleSearch}
          className={`bg-[#2c6449] hover:bg-green-700 text-white text-xs sm:text-sm px-3 sm:px-4 flex items-center gap-1 h-full ${
            isRtl ? "rounded-l-full" : "rounded-r-full"
          }`}
        >
          <Search size={16} />
        </button>
      </div>

      {dropdownOpen && productQuery && (
        <div
          className='absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden'
          style={{ direction: dir }}
        >
          <Command className='w-full bg-white'>
            <CommandInput
              value={productQuery}
              onValueChange={setProductQuery}
              placeholder={t.search_placeholder}
              className='hidden'
            />
            <CommandList className='max-h-64 sm:max-h-[400px] overflow-y-auto'>
              {filteredProducts.length > 0 ? (
                <CommandGroup heading={t.productsHeading}>
                  {filteredProducts.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={handleSelect}
                      className={`flex items-center ${
                        isRtl ? "flex-row-reverse" : "flex-row"
                      } gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 hover:bg-[#2c6449]/10 transition`}
                    >
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className='w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0'
                      />
                      <span className='text-xs sm:text-base text-gray-700 truncate'>
                        {p.name}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <div className='flex flex-col items-center justify-center p-4 sm:p-6 gap-1 text-center'>
                  <img
                    src='/no-results-search.svg'
                    alt='No results'
                    className='w-16 h-16 sm:w-24 sm:h-24 object-contain'
                  />
                  <p className='text-gray-500 text-xs sm:text-sm'>
                    {t.noResults}
                  </p>
                </div>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className='flex sm:hidden'>
        <button
          type='button'
          className='p-2 rounded-full text-[#2c6449]'
          onClick={() => setShowMobileSearch(true)}
        >
          <Search size={22} />
        </button>
      </div>

      {/* Mobile overlay */}
      {showMobileSearch && (
        <div className='fixed inset-0 z-50 flex items-start justify-center sm:hidden bg-transparent backdrop-blur-lg'>
          <div
            ref={cardRef}
            className='bg-white w-full mx-2 mt-12 p-3 rounded-lg shadow-lg relative'
          >
            {SearchBarContent}
          </div>
        </div>
      )}

      {/* Desktop */}
      <div className='hidden sm:block w-full'>{SearchBarContent}</div>
    </>
  );
}
