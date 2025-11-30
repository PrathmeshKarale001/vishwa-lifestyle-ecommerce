"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  MapPinIcon,
  Loader2,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";
import EmptyState from "@/components/EmptyState";
import { AddressesPageSkeleton } from "@/components/AccountSkeleton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number"),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().regex(/^[0-9]{6}$/, "Postal code must be 6 digits"),
  type: z.enum(["home", "work", "other"]).optional(),
  is_default: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  type?: "home" | "work" | "other";
  is_default: boolean;
  created_at: string;
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    reset,
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onBlur", // Real-time validation on blur
    defaultValues: {
      type: "home",
      is_default: false,
    },
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    if (!supabase) {
      toast.error("Supabase not configured");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "PGRST116") {
          // Table doesn't exist yet
          setAddresses([]);
        } else {
          throw error;
        }
      } else {
        setAddresses(data || []);
      }
    } catch (error: any) {
      log.error("Error fetching addresses", error);
      if (error.code !== "PGRST116") {
        toast.error("Unable to load addresses. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    if (!supabase) {
      toast.error("Service unavailable. Please try again later.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // If this is default, unset other defaults
      if (data.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      if (editingId) {
        // Update existing address
        const { error } = await supabase
          .from("addresses")
          .update({
            ...data,
            user_id: user.id,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Address updated successfully!");
      } else {
        // Create new address
        const { error } = await supabase
          .from("addresses")
          .insert({
            ...data,
            user_id: user.id,
          });

        if (error) throw error;
        toast.success("Address added successfully!");
      }

      reset();
      setIsAdding(false);
      setEditingId(null);
      await fetchAddresses();
    } catch (error: any) {
      log.error("Error saving address", error);
      toast.error(error.message || "Unable to save address. Please check your information and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setIsAdding(true);
    setValue("name", address.name);
    setValue("phone", address.phone);
    setValue("line1", address.line1);
    setValue("line2", address.line2 || "");
    setValue("city", address.city);
    setValue("state", address.state);
    setValue("postal_code", address.postal_code);
    setValue("type", address.type || "home");
    setValue("is_default", address.is_default);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    if (!supabase) {
      toast.error("Service unavailable. Please try again later.");
      return;
    }

    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Address deleted successfully");
      await fetchAddresses();
    } catch (error: any) {
      log.error("Error deleting address", error);
      toast.error("Unable to delete address. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "work":
        return <Briefcase size={16} />;
      case "home":
        return <Home size={16} />;
      default:
        return <MapPinIcon size={16} />;
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case "work":
        return "Work";
      case "home":
        return "Home";
      default:
        return "Other";
    }
  };

  if (loading) {
    return <AddressesPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Breadcrumb */}
          <Breadcrumbs
            items={[
              { label: "Account", href: "/account" },
              { label: "My Addresses" },
            ]}
            className="mb-6"
          />

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif">My Addresses</h1>
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                reset();
              }}
              className="flex items-center gap-2 bg-foreground text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors"
            >
              <Plus size={16} /> Add Address
            </button>
          </div>

          {/* Add/Edit Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-background-alt p-6 mb-6"
              >
                <h2 className="font-serif text-xl mb-6">
                  {editingId ? "Edit Address" : "Add New Address"}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Full Name *</label>
                      <div className="relative">
                        <input
                          type="text"
                          {...register("name")}
                          className={`w-full border px-4 py-3 pr-10 focus:outline-none focus:border-accent-gold transition-colors ${
                            errors.name 
                              ? "border-red-500 bg-red-50" 
                              : touchedFields.name && !errors.name
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                          }`}
                          placeholder="John Doe"
                        />
                        {touchedFields.name && !errors.name && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 size={18} className="text-green-500" aria-hidden="true" />
                          </div>
                        )}
                        {errors.name && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <XCircle size={18} className="text-red-500" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} aria-hidden="true" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        {...register("phone")}
                        className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${
                          errors.phone ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      {...register("line1")}
                      className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${
                        errors.line1 ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="House/Flat No., Building Name"
                    />
                    {errors.line1 && (
                      <p className="text-red-500 text-xs mt-1">{errors.line1.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Address Line 2</label>
                    <input
                      type="text"
                      {...register("line2")}
                      className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-accent-gold"
                      placeholder="Street, Area, Landmark"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-2">City *</label>
                      <input
                        type="text"
                        {...register("city")}
                        className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${
                          errors.city ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Mumbai"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm mb-2">State *</label>
                      <input
                        type="text"
                        {...register("state")}
                        className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${
                          errors.state ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Maharashtra"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Postal Code *</label>
                      <input
                        type="text"
                        {...register("postal_code")}
                        className={`w-full border px-4 py-3 focus:outline-none focus:border-accent-gold ${
                          errors.postal_code ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="400001"
                        maxLength={6}
                      />
                      {errors.postal_code && (
                        <p className="text-red-500 text-xs mt-1">{errors.postal_code.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <label className="block text-sm mb-2">Address Type</label>
                      <select
                        {...register("type")}
                        className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-accent-gold"
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="is_default"
                        {...register("is_default")}
                        className="accent-accent-gold"
                      />
                      <label htmlFor="is_default" className="text-sm cursor-pointer">
                        Set as default address
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingId(null);
                        reset();
                      }}
                      className="flex-1 border border-gray-200 py-3 text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || isSubmitting}
                      className="flex-1 bg-foreground text-white py-3 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : editingId ? (
                        "Update Address"
                      ) : (
                        "Save Address"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Addresses List */}
          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background-alt p-6 relative"
                >
                  {address.is_default && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-accent-gold text-xs uppercase tracking-widest">
                      <Check size={14} /> Default
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-white rounded-full">
                      {getTypeIcon(address.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif text-lg">{address.name}</h3>
                        <span className="text-xs text-foreground-muted">
                          {getTypeLabel(address.type)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground-muted mb-1">{address.phone}</p>
                      <p className="text-sm">
                        {address.line1}
                        {address.line2 && `, ${address.line2}`}
                        <br />
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(address)}
                      className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      disabled={isDeleting === address.id}
                      className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      {isDeleting === address.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={14} /> Delete
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MapPin}
              title="No addresses saved"
              description="Add an address to make checkout faster and easier. You can save multiple addresses for home, work, or other locations."
              secondaryAction={{
                label: "Add Your First Address",
                onClick: () => setIsAdding(true),
              }}
            />
          )}
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}

