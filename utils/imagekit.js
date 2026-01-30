import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_URLENDPOINT
});

export default imagekit;