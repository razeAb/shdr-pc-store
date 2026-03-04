import ImageKit from 'imagekit';

export function getImageKit() {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
        throw new Error('ImageKit environment variables are not set properly.');
    }

    return new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
    });
}