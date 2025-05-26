import { Loader2 } from 'lucide-react'

const loading = () => {
  return (
    <div className="flex flex-row justify-center items-center bg-gradient-to-r from-white via-blue-50 to-white">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
    </div>
  )
}

export default loading