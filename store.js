import { create } from "zustand";

const useStore = create((set)=>({
    "hostServer": import.meta.env.VITE_HOST_SERVER,
}))

export default useStore;