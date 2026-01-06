import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Mail, Save, LogOut, Package, MapPin, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Profile = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        getProfile();
    }, [user, navigate]);

    const getProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, phone, avatar_url')
                .eq('id', user?.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setFullName(data.full_name || '');
                setPhone(data.phone || '');
                setAvatarUrl(data.avatar_url || '');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            // toast.error('Error loading profile');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    user_id: user?.id,
                    full_name: fullName,
                    phone: phone,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            toast.success('تم تحديث الملف الشخصي بنجاح');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('حدث خطأ أثناء التحديث');
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">تحميل...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="container flex items-center justify-between h-16 px-4">
                    <Link to="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </motion.button>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">الملف الشخصي</h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </header>

            <main className="container px-4 py-6 space-y-6">

                {/* User Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4"
                >
                    <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mb-2">
                        <User className="w-10 h-10 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{fullName || 'مستخدم جديد'}</h2>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                </motion.div>

                {/* Edit Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6"
                >
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-600" />
                        المعلومات الشخصية
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullname">الاسم الكامل</Label>
                            <div className="relative">
                                <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                <Input
                                    id="fullname"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pr-10 bg-gray-50 border-gray-200"
                                    placeholder="أدخل اسمك"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">رقم الهاتف</Label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pr-10 bg-gray-50 border-gray-200"
                                    placeholder="أدخل رقم هاتفك"
                                />
                            </div>
                        </div>

                        <Button onClick={updateProfile} disabled={saving} className="w-full rounded-xl h-12 text-base font-semibold">
                            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            {!saving && <Save className="w-4 h-4 mr-2" />}
                        </Button>
                    </div>
                </motion.div>

                {/* Menu Links (Placeholders) */}
                <div className="space-y-3">
                    {[
                        { icon: Package, label: 'طلباتي', path: '#' },
                        { icon: MapPin, label: 'عناوين التوصيل', path: '/addresses' },
                        { icon: CreditCard, label: 'طرق الدفع', path: '#' },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                        >
                            <Link to={item.path} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                        <item.icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">{item.label}</span>
                                </div>
                                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Logout */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={handleSignOut}
                    className="w-full p-4 flex items-center justify-center gap-2 text-red-500 font-medium bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                </motion.button>

            </main>
        </div>
    );
};

export default Profile;
