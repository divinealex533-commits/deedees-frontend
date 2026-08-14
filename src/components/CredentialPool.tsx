import { useState } from 'react';
import { Plus, Upload, X, KeyRound, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { Product, Category } from '@/types';
import { toast } from 'sonner';

interface AdminItem {
  id: string;
  accessLinks?: string[];
  accessLink?: string;
  quantity?: number;
}

interface CredentialRow {
  credential: string;
  previewLink: string;
}

interface CredentialPoolProps {
  products: Product[];
  categories: Category[];
  adminItems: AdminItem[];
  onUploaded?: () => Promise<void> | void;
}

export function CredentialPool({
  products,
  categories,
  adminItems,
  onUploaded,
}: CredentialPoolProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null
  );

  const [rows, setRows] = useState<CredentialRow[]>([
    {
      credential: '',
      previewLink: '',
    },
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const selectedAdminItem = adminItems.find(
    (item) => item.id === selectedProductId
  );

  const poolCount =
    selectedAdminItem?.accessLinks?.length ?? 0;

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId
  );

  const updateRow = (
    index: number,
    field: keyof CredentialRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const addMoreItems = () => {
    setRows((prev) => [
      ...prev,
      {
        credential: '',
        previewLink: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return [
          {
            credential: '',
            previewLink: '',
          },
        ];
      }

      return prev.filter(
        (_, rowIndex) => rowIndex !== index
      );
    });
  };

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);

    setRows([
      {
        credential: '',
        previewLink: '',
      },
    ]);
  };

  const handleUpload = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product first');
      return;
    }

    const credentials = rows
      .map((row) => row.credential.trim())
      .filter(Boolean);

    if (credentials.length === 0) {
      toast.error('Add at least one credential');
      return;
    }

    try {
      setIsUploading(true);

      const result = await api.addCredentials(
        selectedProductId,
        credentials
      );

      toast.success(
        result.message ||
          `${credentials.length} credential${
            credentials.length === 1 ? '' : 's'
          } uploaded successfully`
      );

      setRows([
        {
          credential: '',
          previewLink: '',
        },
      ]);

      await onUploaded?.();
    } catch (err) {
      toast.error(
        (err as Error).message ||
          'Could not upload credentials'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategoryId((current) =>
      current === categoryId ? null : categoryId
    );
  };

  const handleSelectProduct = (product: Product) => {
    handleProductChange(product.id);
  };

  return (
    <Card className="bg-slate-950 border-blue-500/20 overflow-hidden">
      <CardContent className="p-0">

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-blue-500/10">
          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <KeyRound className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  Credential Pool
                </h2>

                {selectedProductId && (
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {poolCount} in pool
                  </Badge>
                )}
              </div>

              <p className="text-slate-400 text-sm mt-1">
                Select a product from its category and upload
                credentials into that product's available stock.
              </p>
            </div>

          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6">

          {/* Categories + Products */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Products by Category
            </label>

            <div className="space-y-2">

     {categories.map((category) => {
                const categoryProducts = products.filter(
                  (product) =>
                    product.categoryId === category.id
                );

                if (categoryProducts.length === 0) {
                  return null;
                }

                const isExpanded =
                  expandedCategoryId === category.id;

                return (
                  <div
                    key={category.id}
                    className="rounded-xl border border-blue-500/20 overflow-hidden bg-slate-900/60"
                  >
                    {/* Category */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleCategory(category.id)
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/70 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 font-bold">
                          {category.name.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 text-left">
                        <p className="text-white text-sm font-semibold">
                          {category.name}
                        </p>

                        <p className="text-slate-500 text-xs">
                          {categoryProducts.length}{' '}
                          {categoryProducts.length === 1
                            ? 'product'
                            : 'products'}
                        </p>
                      </div>

                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      )}
                    </button>

                    {/* Products */}
                    {isExpanded && (
                      <div className="border-t border-blue-500/10 bg-black/30">
                        {categoryProducts.map((product) => {
                          const adminItem = adminItems.find(
                            (item) =>
                              item.id === product.id
                          );

                          const productPoolCount =
                            adminItem?.accessLinks?.length ?? 0;

                          const isSelected =
                            selectedProductId === product.id;

                          return (
                            <button
                              type="button"
                              key={product.id}
                              onClick={() =>
                                handleSelectProduct(product)
                              }
                              className={`w-full flex items-center gap-3 px-4 py-3 pl-8 text-left transition-colors ${
                                isSelected
                                  ? 'bg-blue-500/15 border-l-2 border-blue-400'
                                  : 'hover:bg-slate-900'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-900 flex-shrink-0">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <KeyRound className="h-3.5 w-3.5 text-slate-600" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-white text-sm font-medium truncate">
                                  {product.name}
                                </p>

                                <p className="text-blue-400 text-xs">
                                  ₦{product.price.toLocaleString()}
                                </p>
                              </div>

                              <Badge
                                className={
                                  productPoolCount > 0
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-slate-800 text-slate-500'
                                }
                              >
                                {productPoolCount} in pool
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {categories.every(
                (category) =>
                  !products.some(
                    (product) =>
                      product.categoryId === category.id
                  )
              ) && (
                <div className="rounded-xl border border-dashed border-blue-500/20 p-6 text-center">
                  <p className="text-slate-400 text-sm">
                    No products have been added to your categories yet.
                  </p>

                  <p className="text-slate-600 text-xs mt-1">
                    Add a product first and assign it to a category.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Selected Product */}
          {selectedProduct && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                Selected Product
              </p>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-white font-semibold">
                    {selectedProduct.name}
                  </p>

                  <p className="text-blue-400 text-xs mt-1">
                    Current pool: {poolCount}
                  </p>
                </div>

                <Badge className="bg-blue-500/20 text-blue-400">
                  Ready
                </Badge>
              </div>
            </div>
          )}

          {/* Item Details */}
          {selectedProductId && (
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Item Details
              </label>

              <div className="space-y-4">

                {rows.map((row, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-dashed border-blue-500/30 bg-slate-900/70 p-4"
                  >

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-sm font-semibold">
                        Credential {index + 1}
                      </span>

                      <span className="text-slate-500 text-xs">
                        Pool unit #{poolCount + index + 1}
                      </span>
                    </div>

                    <div className="space-y-3">

                      {/* Credential */}
                      <input
                        value={row.credential}
                        onChange={(e) =>
                          updateRow(
                            index,
                            'credential',
                            e.target.value
                          )
                        }
                        placeholder="email|password"
                        className="w-full h-12 rounded-xl bg-slate-950 border border-blue-500/20 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />

                      {/* Preview Link */}
                      <input
                        value={row.previewLink}
                        onChange={(e) =>
                          updateRow(
                            index,
                            'previewLink',
                            e.target.value
                          )
                        }
                        placeholder="Preview link (optional)"
                        className="w-full h-12 rounded-xl bg-slate-950 border border-blue-500/20 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        className="w-full h-11 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                      >
                        <X className="h-5 w-5" />
                      </button>

                    </div>
                  </div>
                ))}

              </div>
            </div>
          )}

          {/* Add More */}
          {selectedProductId && (
            <Button
              type="button"
              variant="outline"
              onClick={addMoreItems}
              className="w-full h-12 border-dashed border-blue-500/30 text-white hover:bg-blue-500/10 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add More Credentials
            </Button>
          )}

          {/* Upload */}
          <Button
            type="button"
            onClick={handleUpload}
            disabled={
              isUploading ||
              !selectedProductId
            }
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl"
          >
            <Upload className="h-4 w-4 mr-2" />

            {isUploading
              ? 'Uploading Credentials...'
              : 'Upload Credentials'}
          </Button>

          <p className="text-slate-500 text-xs text-center">
            Each uploaded credential becomes one unit
            in the selected product's credential pool.
          </p>

        </div>
      </CardContent>
    </Card>
  );
}
