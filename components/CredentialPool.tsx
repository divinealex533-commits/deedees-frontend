import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  KeyRound,
  Loader2,
  Plus,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types";
import { toast } from "sonner";

interface AdminItem {
  id: string;
  accessLinks?: string[];
  accessLink?: string;
  quantity?: number;
}

interface CredentialItem {
  email: string;
  password: string;
  notes: string;
  previewLink: string;
}

interface CredentialPoolProps {
  products: Product[];
  categories: Category[];
  adminItems: AdminItem[];
  onUploaded?: () => Promise<void> | void;
}

const emptyItem = (): CredentialItem => ({
  email: "",
  password: "",
  notes: "",
  previewLink: "",
});

function getTonyixProductId(product: Product): string {
  const item = product as Product & {
    tonyixProductId?: string | number | null;
    tonyixId?: string | number | null;
  };

  return String(
    item.tonyixProductId ??
      item.tonyixId ??
      product.id ??
      ""
  );
}

export function CredentialPool({
  products,
  categories,
  adminItems,
  onUploaded,
}: CredentialPoolProps) {
  const [expandedCategory, setExpandedCategory] =
    useState<string | null>(categories[0]?.id ?? null);

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [items, setItems] = useState<CredentialItem[]>([
    emptyItem(),
  ]);

  const [price, setPrice] = useState("");

  const [uploading, setUploading] = useState(false);

  const [showCategoryForm, setShowCategoryForm] =
    useState(false);

  const [categoryName, setCategoryName] =
    useState("");

  /*
   * IMPORTANT:
   *
   * This number comes from the reseller's product list.
   * Nothing is hard-coded as "166".
   */
  const availableProductCount = products.length;

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId
  );

  const selectedStock = useMemo(() => {
    if (!selectedProductId) return 0;

    const stock = adminItems.find(
      (item) => item.id === selectedProductId
    );

    return (
      stock?.accessLinks?.length ??
      stock?.quantity ??
      0
    );
  }, [adminItems, selectedProductId]);

  const updateItem = (
    index: number,
    field: keyof CredentialItem,
    value: string
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      emptyItem(),
    ]);
  };

  const removeItem = (index: number) => {
    setItems((current) => {
      if (current.length === 1) {
        return [emptyItem()];
      }

      return current.filter(
        (_, itemIndex) => itemIndex !== index
      );
    });
  };

  const selectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setPrice(String(product.price ?? ""));
    setItems([emptyItem()]);
  };

  /*
   * Category creation is intentionally kept flexible.
   * If createCategory exists in api.ts, it will be used.
   */
  const createCategory = async () => {
    const name = categoryName.trim();

    if (!name) {
      toast.error("Enter a category name");
      return;
    }

    const sellerApi = api as typeof api & {
      createCategory?: (
        name: string
      ) => Promise<unknown>;
    };

    if (!sellerApi.createCategory) {
      toast.error(
        "Create category API is not connected yet"
      );
      return;
    }

    try {
      await sellerApi.createCategory({
  name,
});

      toast.success(
        `${name} category created`
      );

      setCategoryName("");
      setShowCategoryForm(false);

      await onUploaded?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create category"
      );
    }
  };

  const uploadItems = async () => {
    if (!selectedProduct) {
      toast.error("Select a product first");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.email.trim() ||
        item.password.trim() ||
        item.notes.trim()
    );

    if (!validItems.length) {
      toast.error(
        "Add at least one credential item"
      );
      return;
    }

    const tonyixProductId =
      getTonyixProductId(selectedProduct);

    if (!tonyixProductId) {
      toast.error(
        "This product has no Tonyix product ID"
      );
      return;
    }

    const sellerApi = api as typeof api & {
      createSellerListing?: (
        payload: Record<string, unknown>
      ) => Promise<unknown>;
    };

    if (!sellerApi.createSellerListing) {
      toast.error(
        "createSellerListing is missing from api.ts"
      );
      return;
    }

    try {
      setUploading(true);

      /*
       * Every credential card becomes ONE
       * separate customer item.
       */
      const accessLinks = validItems.map(
        (item) => ({
          email: item.email.trim(),
          password: item.password.trim(),
          notes: item.notes.trim(),
          previewLink:
            item.previewLink.trim(),
        })
      );

      const payload = {
        title: selectedProduct.name,

        name: selectedProduct.name,

        description:
          (
            selectedProduct as Product & {
              description?: string;
            }
          ).description ?? "",

        price: Number(
          price ||
            selectedProduct.price ||
            0
        ),

        categoryId:
          selectedProduct.categoryId,

        tonyixProductId,

        quantity: validItems.length,

        accessLinks,

        previewLinks: validItems
          .map((item) =>
            item.previewLink.trim()
          )
          .filter(Boolean),
      };

      await sellerApi.createSellerListing(
        payload
      );

      toast.success(
        `${validItems.length} ${
          validItems.length === 1
            ? "item"
            : "items"
        } uploaded successfully`
      );

      setItems([emptyItem()]);

      await onUploaded?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload items"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-blue-500/20 bg-slate-950 shadow-2xl">
      <CardContent className="p-0">

        {/* ================= HEADER ================= */}

        <div className="relative overflow-hidden border-b border-blue-500/10 bg-gradient-to-br from-blue-950/70 via-slate-950 to-cyan-950/30 p-6 sm:p-7">

          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
                <KeyRound className="h-6 w-6 text-white" />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    Credential Pool
                  </h2>

                  <Badge className="bg-blue-500/15 text-blue-300">
                    {availableProductCount} Products Available
                  </Badge>

                </div>

                <p className="mt-1 max-w-2xl text-sm text-slate-400">
                  Organize your products by category
                  and keep every customer's credentials
                  as a separate item.
                </p>

              </div>

            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setShowCategoryForm(
                  (current) => !current
                )
              }
              className="border-blue-500/30 bg-slate-900/70 text-white hover:bg-blue-500/10"
            >
              <Tag className="mr-2 h-4 w-4" />
              Create Sub-Category
            </Button>

          </div>

          {showCategoryForm && (
            <div className="relative mt-5 rounded-2xl border border-blue-500/20 bg-black/30 p-4">

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  value={categoryName}
                  onChange={(event) =>
                    setCategoryName(
                      event.target.value
                    )
                  }
                  placeholder="Category name"
                  className="h-11 flex-1 rounded-xl border border-blue-500/20 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                />

                <Button
                  type="button"
                  onClick={createCategory}
                  className="h-11 bg-blue-500 text-white hover:bg-blue-600"
                >
                  Create Category
                </Button>

              </div>

            </div>
          )}

        </div>

        {/* ================= MAIN ================= */}

        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.85fr_1.15fr]">

          {/* ================= PRODUCTS ================= */}

          <section>

            <div className="mb-4">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Select Product
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Choose a product from your reseller catalogue.
              </p>

            </div>

            <div className="space-y-2">

              {categories.map((category) => {

                const categoryProducts =
                  products.filter(
                    (product) =>
                      product.categoryId ===
                      category.id
                  );

                const expanded =
                  expandedCategory ===
                  category.id;

                return (
                  <div
                    key={category.id}
                    className="overflow-hidden rounded-2xl border border-blue-500/15 bg-slate-900/50"
                  >

                    {/* CATEGORY */}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCategory(
                          expanded
                            ? null
                            : category.id
                        )
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-800/70"
                    >

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 font-bold text-blue-400">
                        {category.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-white">
                          {category.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {categoryProducts.length}{" "}
                          {categoryProducts.length ===
                          1
                            ? "product"
                            : "products"}
                        </p>

                      </div>

                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      )}

                    </button>

                    {/* PRODUCTS */}

                    {expanded && (
                      <div className="border-t border-blue-500/10">

                        {categoryProducts.map(
                          (product) => {

                            const active =
                              selectedProductId ===
                              product.id;

                            const stock =
                              adminItems.find(
                                (item) =>
                                  item.id ===
                                  product.id
                              );

                            const stockCount =
                              stock
                                ?.accessLinks
                                ?.length ??
                              stock?.quantity ??
                              0;

                            return (
                              <button
                                type="button"
                                key={product.id}
                                onClick={() =>
                                  selectProduct(
                                    product
                                  )
                                }
                                className={`flex w-full items-center gap-3 border-l-2 px-4 py-3 pl-8 text-left transition ${
                                  active
                                    ? "border-blue-400 bg-blue-500/10"
                                    : "border-transparent hover:bg-slate-900"
                                }`}
                              >

                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-800">

                                  {product.imageUrl ? (
                                    <img
                                      src={
                                        product.imageUrl
                                      }
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <KeyRound className="h-4 w-4 text-slate-600" />
                                    </div>
                                  )}

                                </div>

                                <div className="min-w-0 flex-1">

                                  <p className="truncate text-sm font-medium text-white">
                                    {product.name}
                                  </p>

                                  <p className="text-xs text-blue-400">
                                    ₦
                                    {Number(
                                      product.price ||
                                        0
                                    ).toLocaleString()}
                                  </p>

                                </div>

                                <Badge className="bg-slate-800 text-slate-300">
                                  {stockCount} stock
                                </Badge>

                              </button>
                            );
                          }
                        )}

                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          </section>

          {/* ================= ITEM POOL ================= */}

          <section>

            {!selectedProduct ? (

              <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-blue-500/20 bg-slate-900/30 p-8 text-center">

                <div>

                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                    <KeyRound className="h-7 w-7 text-blue-400" />
                  </div>

                  <h3 className="font-semibold text-white">
                    Select a Product
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Select a product on the left
                    to open its credential pool.
                  </p>

                </div>

              </div>

            ) : (

              <div>

                {/* PRODUCT HEADER */}

                <div className="mb-5 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 p-4">

                  <div className="flex items-center gap-3">

                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-800">

                      {selectedProduct.imageUrl && (
                        <img
                          src={
                            selectedProduct.imageUrl
                          }
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-xs uppercase tracking-wider text-blue-400">
                        Selected Product
                      </p>

                      <h3 className="truncate text-lg font-bold text-white">
                        {selectedProduct.name}
                      </h3>

                      <p className="text-xs text-slate-500">
                        Tonyix Product ID:{" "}
                        {getTonyixProductId(
                          selectedProduct
                        )}
                      </p>

                    </div>

                    <Badge className="bg-green-500/10 text-green-400">
                      {selectedStock} in pool
                    </Badge>

                  </div>

                </div>

                {/* PRICE */}

                <div className="mb-5">

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Product Price
                  </label>

                  <input
                    value={price}
                    onChange={(event) =>
                      setPrice(
                        event.target.value
                      )
                    }
                    placeholder="₦0"
                    inputMode="decimal"
                    className="h-12 w-full rounded-xl border border-blue-500/20 bg-slate-900 px-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                  />

                </div>

                {/* ITEM TITLE */}

                <div className="mb-3 flex items-center justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Item Details
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Each item is for a different customer.
                    </p>

                  </div>

                  <Badge className="bg-blue-500/10 text-blue-300">
                    {items.length}{" "}
                    {items.length === 1
                      ? "Item"
                      : "Items"}
                  </Badge>

                </div>

                {/* CREDENTIAL CARDS */}

                <div className="space-y-4">

                  {items.map(
                    (item, index) => (

                      <div
                        key={index}
                        className="rounded-2xl border border-blue-500/15 bg-slate-900/70 p-4 shadow-lg shadow-black/10"
                      >

                        <div className="mb-4 flex items-center justify-between">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400">
                              {index + 1}
                            </div>

                            <span className="text-sm font-semibold text-white">
                              Customer Item{" "}
                              {index + 1}
                            </span>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>

                        <div className="space-y-3">

                          {/* EMAIL */}

                          <input
                            value={item.email}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "email",
                                event.target.value
                              )
                            }
                            placeholder="Email"
                            className="h-12 w-full rounded-xl border border-blue-500/15 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                          />

                          {/* PASSWORD */}

                          <input
                            value={item.password}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "password",
                                event.target.value
                              )
                            }
                            placeholder="Password"
                            className="h-12 w-full rounded-xl border border-blue-500/15 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                          />

                          {/* NOTES */}

                          <textarea
                            value={item.notes}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "notes",
                                event.target.value
                              )
                            }
                            placeholder="Paste notes, extra credentials, instructions or anything the customer needs..."
                            rows={4}
                            className="w-full resize-none rounded-xl border border-blue-500/15 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                          />

                          {/* PREVIEW LINK */}

                          <div className="relative">

                            <ExternalLink className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-600" />

                            <input
                              value={
                                item.previewLink
                              }
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "previewLink",
                                  event.target
                                    .value
                                )
                              }
                              placeholder="Preview link (optional)"
                              className="h-12 w-full rounded-xl border border-blue-500/15 bg-slate-950 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                            />

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

                {/* ACTIONS */}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="h-12 border-dashed border-blue-500/30 bg-transparent text-white hover:bg-blue-500/10"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>

                  <Button
                    type="button"
                    onClick={uploadItems}
                    disabled={uploading}
                    className="h-12 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-cyan-600"
                  >

                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}

                    {uploading
                      ? "Uploading Items..."
                      : "Upload Items"}

                  </Button>

                </div>

              </div>

            )}

          </section>

        </div>

      </CardContent>
    </Card>
  );
}

export default CredentialPool;
