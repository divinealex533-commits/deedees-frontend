import { useState } from 'react';
import { Plus, Upload, X, KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { Product } from '@/types';
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
  adminItems: AdminItem[];
  onUploaded?: () => Promise<void> | void;
}

export function CredentialPool({
  products,
  adminItems,
  onUploaded,
}: CredentialPoolProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
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

  const handleProductChange = (
    productId: string
  ) => {
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
                  Add Items
                </h2>

                {selectedProductId && (
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {poolCount} in pool
                  </Badge>
                )}
              </div>

              <p className="text-slate-400 text-sm mt-1">
                Select product and upload one or more
                item details with optional preview links.
              </p>
            </div>

          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6">

          {/* Product */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Product
            </label>

            <select
              value={selectedProductId}
              onChange={(e) =>
                handleProductChange(e.target.value)
              }
              className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500"
            >
              <option value="">
                -- Select Product --
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                </option>
              ))}
            </select>

            <p className="text-slate-500 text-xs mt-2">
              {products.length} products available
              for upload.
            </p>
          </div>

          {/* Item Details */}
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
                      Item {index + 1}
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

          {/* Add More */}
          <Button
            type="button"
            variant="outline"
            onClick={addMoreItems}
            className="w-full h-12 border-dashed border-blue-500/30 text-white hover:bg-blue-500/10 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More Items
          </Button>

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
              ? 'Uploading Items...'
              : 'Upload Items'}
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
