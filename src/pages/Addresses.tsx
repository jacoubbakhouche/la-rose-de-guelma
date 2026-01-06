import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Plus, Trash2, CheckCircle, Home, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Address {
    id: string;
    full_name: string;
    address_line1: string;
    wilaya: string;
    commune: string;
    phone: string;
    is_default: boolean;
    label?: string; // e.g. Home, Work (optional in minimal schema, mapped by logic)
}

const ALGERIA_WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
    "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda",
    "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara",
    "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
    "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
    "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam",
    "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

const Addresses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        address_line1: '',
        wilaya: '',
        commune: '',
        wilaya: '',
        commune: '',
        phone: '',
        is_default: false
    });

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        fetchAddresses();
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .order('is_default', { ascending: false });

            if (error) throw error;
            setAddresses(data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('فشل في تحميل العناوين');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.full_name || !newAddress.address_line1 || !newAddress.wilaya || !newAddress.phone) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        setSubmitting(true);
        try {
            // If this is the first address, make it default automatically
            const isFirst = addresses.length === 0;
            const payload = {
                ...newAddress,
                user_id: user?.id,
                is_default: isFirst || newAddress.is_default
            };

            // If ensuring only one default, we might need to unset others first
            if (payload.is_default && !isFirst) {
                await supabase.from('addresses').update({ is_default: false }).eq('user_id', user?.id);
            }

            const { error } = await supabase.from('addresses').insert(payload);
            if (error) throw error;

            toast.success('تمت إضافة العنوان بنجاح');
            setIsOpen(false);
            setNewAddress({ full_name: '', address_line1: '', wilaya: '', commune: '', phone: '', is_default: false });
            fetchAddresses();
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('حدث خطأ أثناء الإضافة');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('addresses').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم حذف العنوان');
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    const setDefault = async (id: string) => {
        try {
            // Unset all
            await supabase.from('addresses').update({ is_default: false }).eq('user_id', user?.id);
            // Set new default
            await supabase.from('addresses').update({ is_default: true }).eq('id', id);

            toast.success('تم تحديث العنوان الافتراضي');
            fetchAddresses();
        } catch (error) {
            toast.error('فشل التحديث');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="container flex items-center justify-between h-16 px-4">
                    <Link to="/profile">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </motion.button>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">عناوين التوصيل</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="container px-4 py-6 space-y-6">

                {/* Add New Button */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-14 bg-white border border-dashed border-primary/50 rounded-2xl flex items-center justify-center gap-2 text-primary font-medium hover:bg-primary/5 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>إضافة عنوان جديد</span>
                        </motion.button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-right">إضافة عنوان جديد</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="grid gap-2">
                                <Label className="text-right">اسم المستلم</Label>
                                <Input
                                    value={newAddress.full_name}
                                    onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                    placeholder="محمد بن فلان"
                                    className="text-right"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-right">رقم الهاتف</Label>
                                <Input
                                    value={newAddress.phone}
                                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    placeholder="05 55 ..."
                                    className="text-right"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-right">الولاية</Label>
                                <Select
                                    onValueChange={val => setNewAddress({ ...newAddress, wilaya: val })}
                                    value={newAddress.wilaya}
                                >
                                    <SelectTrigger className="w-full text-right" dir="rtl">
                                        <SelectValue placeholder="اختر الولاية" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]" dir="rtl">
                                        {ALGERIA_WILAYAS.map(w => (
                                            <SelectItem key={w} value={w}>{w}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-right">البلدية</Label>
                                <Input
                                    value={newAddress.commune}
                                    onChange={e => setNewAddress({ ...newAddress, commune: e.target.value })}
                                    placeholder="اسم البلدية"
                                    className="text-right"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-right">العنوان (الحي، الشارع...)</Label>
                                <Input
                                    value={newAddress.address_line1}
                                    onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                    placeholder="وصف دقيق للموقع..."
                                    className="text-right"
                                />
                            </div>
                            <Button onClick={handleAddAddress} disabled={submitting} className="mt-4">
                                {submitting ? 'جاري الحفظ...' : 'حفظ العنوان'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-10">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">لا توجد عناوين محفوظة</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {addresses.map((address) => (
                                <motion.div
                                    key={address.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative bg-white p-5 rounded-[1.5rem] border transition-all ${address.is_default
                                        ? 'border-primary/50 shadow-[0_4px_20px_rgba(124,58,237,0.08)]'
                                        : 'border-gray-100 shadow-sm'
                                        }`}
                                >
                                    {/* Default Badge */}
                                    {address.is_default && (
                                        <div className="absolute top-5 left-5 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>الافتراضي</span>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${address.is_default ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-500'
                                            }`}>
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h3 className="font-bold text-gray-900">{address.full_name}</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {address.address_line1}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {address.commune}, {address.wilaya}
                                            </p>
                                            <p className="text-xs text-gray-400 font-mono mt-1 pt-1 border-t border-gray-50 border-dashed inline-block">
                                                {address.phone}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-50">
                                        {!address.is_default && (
                                            <button
                                                onClick={() => setDefault(address.id)}
                                                className="text-xs font-medium text-gray-500 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                تعيين كافتراضي
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Addresses;
