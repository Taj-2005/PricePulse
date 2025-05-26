import { Loader2 } from 'lucide-react'
import Navbar from '@/app/components/Navbar';
import LoginBtn from '@/app/components/LoginBtn';

const loading = () => {
  return (
    <>
        <Navbar AuthButton={<LoginBtn />}/>
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-white via-blue-50 to-white">
        <Loader2 className="animate-spin h-10 w-10 text-blue-400" />
        </div>
    </>
  );
};

export default loading;