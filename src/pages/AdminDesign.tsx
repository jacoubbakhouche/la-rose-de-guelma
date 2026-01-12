import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Trash2, Image as ImageIcon, Search } from "lucide-react";

interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    button_text: string;
    button_link: string;
    is_active: boolean;
    display_order: number;
}

const AdminDesign = () => {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);

    // Product Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickingSlideId, setPickingSlideId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchSlides();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await supabase.from('products' as any).select('id, name');
            if (data) setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchSlides = async () => {
        try {
            const { data, error } = await supabase
                .from("hero_slides" as any)
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;
            setSlides(data || []);
        } catch (error) {
            console.error("Error fetching slides:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        try {
            if (!file) return null;
            setUploading(true);
            const fileExt = file.name.split(".").pop();
            const filePath = `hero/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("products")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("products").getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("فشل رفع الصورة");
            return null;
        } finally {
            setUploading(false);
        }
    };

    const addSlide = async () => {
        const newSlide = {
            title: "Step Into Style",
            subtitle: "New Collection",
            button_text: "Show More",
            button_link: "/products",
            image_url: "",
            is_active: true,
            display_order: slides.length,
        };

        try {
            const { data, error } = await supabase.from("hero_slides" as any).insert(newSlide).select().single();
            if (error) throw error;
            // @ts-ignore
            setSlides([...slides, data]);
            toast.success("تم إضافة شريحة جديدة");
        } catch (error) {
            toast.error("حدث خطأ أثناء الإضافة");
        }
    };

    const updateSlide = async (id: string, updates: Partial<HeroSlide>) => {
        try {
            const { error } = await supabase.from("hero_slides" as any).update(updates).eq("id", id);
            if (error) throw error;
            setSlides(slides.map((s) => (s.id === id ? { ...s, ...updates } : s)));
            toast.success("تم التحديث");
        } catch (error) {
            toast.error("فشل التحديث");
        }
    };

    const deleteSlide = async (id: string) => {
        try {
            const { error } = await supabase.from("hero_slides" as any).delete().eq("id", id);
            if (error) throw error;
            setSlides(slides.filter((s) => s.id !== id));
            toast.success("تم الحذف");
        } catch (error) {
            toast.error("فشل الحذف");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8" dir="rtl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    تخصيص الواجهة
                </h1>
                <Button onClick={addSlide} className="gap-2">
                    <Plus className="w-4 h-4" /> إضافة شريحة
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {slides.map((slide) => (
                        <Card key={slide.id} className="relative overflow-hidden">
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 flex items-center justify-center">
                                            {slide.image_url ? (
                                                <img src={slide.image_url} alt="Slide" className="w-full h-full object-contain" />
                                            ) : (
                                                <ImageIcon className="w-12 h-12 text-gray-300" />
                                            )}
                                            <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center group">
                                                <Input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const url = await handleImageUpload(file);
                                                            if (url) updateSlide(slide.id, { image_url: url });
                                                        }
                                                    }}
                                                />
                                                <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-opacity">
                                                    {uploading ? 'جاري الرفع...' : 'تغيير الصورة'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label>العنوان الرئيسي</Label>
                                            <Input
                                                value={slide.title}
                                                onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                                                placeholder="Step Into Style"
                                                className="font-bold text-lg"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>العنوان الفرعي</Label>
                                            <Input
                                                value={slide.subtitle}
                                                onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                                                placeholder="New Collection..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>نص الزر</Label>
                                                <Input
                                                    value={slide.button_text}
                                                    onChange={(e) => updateSlide(slide.id, { button_text: e.target.value })}
                                                    placeholder="Show More"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>رابط الزر (أو اختر منتج)</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={slide.button_link}
                                                        onChange={(e) => updateSlide(slide.id, { button_link: e.target.value })}
                                                        placeholder="/products/..."
                                                        className="text-left"
                                                        dir="ltr"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => {
                                                            setPickingSlideId(slide.id);
                                                            setIsPickerOpen(true);
                                                            setSearchTerm("");
                                                        }}
                                                        title="بحث عن منتج"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={slide.is_active}
                                                    onCheckedChange={(checked) => updateSlide(slide.id, { is_active: checked })}
                                                />
                                                <Label>نشط</Label>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => deleteSlide(slide.id)}
                                            >
                                                <Trash2 className="w-4 h-4" /> حذف
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {slides.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
                            <p className="text-muted-foreground">لا توجد شرائح. اضغط على "إضافة شريحة" للبدء.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Product Selection Dialog */}
            <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>اختر منتجاً للربط</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="بحث عن منتج..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-9"
                            />
                        </div>
                        <ScrollArea className="h-[300px] border rounded-md p-2">
                            {filteredProducts.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredProducts.map((p) => (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                if (pickingSlideId) {
                                                    updateSlide(pickingSlideId, { button_link: `/product/${p.id}` });
                                                    setIsPickerOpen(false);
                                                    toast.success("تم اختيار المنتج");
                                                }
                                            }}
                                            className="p-3 hover:bg-accent rounded-lg cursor-pointer flex justify-between items-center transition-colors group"
                                        >
                                            <span className="font-medium group-hover:text-primary transition-colors">{p.name}</span>
                                            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                                ID: {p.id.slice(0, 4)}...
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
                                    لا توجد منتجات مطابقة
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDesign;
