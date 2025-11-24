import { useCallback } from "react";
import toast from "react-hot-toast";

export function useConfirm() {
  const confirm = useCallback(
    (message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const toastId = toast(
          (t) => (
            <div className="flex flex-col gap-3 p-2">
              <p className="text-sm font-medium text-gray-900">{message}</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    resolve(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          ),
          {
            duration: Infinity,
            style: {
              padding: "1rem",
              maxWidth: "400px",
            },
          }
        );
      });
    },
    []
  );

  return confirm;
}
