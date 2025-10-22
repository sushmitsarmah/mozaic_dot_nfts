import { useState, useEffect } from 'react';

interface Attribute {
    trait_type: string;
    value: string;
}

interface NFTMetadata {
    name: string;
    description: string;
    external_url: string;
    attributes: Attribute[];
}

interface UseNFTMetadataProps {
    currentMetadata?: any;
    isOpen: boolean;
}

export function useNFTMetadata({ currentMetadata, isOpen }: UseNFTMetadataProps) {
    const [nftData, setNftData] = useState<NFTMetadata>({
        name: '',
        description: '',
        external_url: '',
        attributes: [{ trait_type: '', value: '' }]
    });
    const [imageUrl, setImageUrl] = useState<string>("");
    const [audioUrl, setAudioUrl] = useState<string>("");
    const [audioDesc, setAudioDesc] = useState<string>("");

    useEffect(() => {
        if (isOpen && currentMetadata) {
            // Load basic info
            setNftData({
                name: currentMetadata.name || '',
                description: currentMetadata.description || '',
                external_url: currentMetadata.external_url || '',
                attributes: currentMetadata.attributes?.filter((attr: any) =>
                    attr.trait_type !== 'audio' &&
                    attr.trait_type !== 'audio_description'
                ) || [{ trait_type: '', value: '' }]
            });

            // Extract image hash - handle various IPFS URL formats
            if (currentMetadata.image) {
                let imageHash = currentMetadata.image
                    .replace(/^ipfs:\/\/ipfs\//, '')
                    .replace(/^ipfs:\/\//, '')
                    .replace(/^https?:\/\/[^\/]+\/ipfs\//, ''); // Handles any gateway domain

                // Remove subdomain gateway format (e.g., HASH.ipfs.dweb.link)
                if (imageHash.includes('.ipfs.')) {
                    imageHash = imageHash.split('.ipfs.')[0];
                }

                // Clean up any remaining URL artifacts
                imageHash = imageHash.split('?')[0].split('#')[0].replace(/\/$/, '');

                setImageUrl(imageHash);
            }

            // Extract audio info
            const audioAttr = currentMetadata.attributes?.find(
                (attr: any) => attr.trait_type === 'audio'
            );
            const audioDescAttr = currentMetadata.attributes?.find(
                (attr: any) => attr.trait_type === 'audio_description'
            );

            if (audioAttr) {
                let audioHash = audioAttr.value
                    .replace(/^ipfs:\/\/ipfs\//, '')
                    .replace(/^ipfs:\/\//, '')
                    .replace(/^https?:\/\/[^\/]+\/ipfs\//, ''); // Handles any gateway domain

                // Remove subdomain gateway format
                if (audioHash.includes('.ipfs.')) {
                    audioHash = audioHash.split('.ipfs.')[0];
                }

                // Clean up any remaining URL artifacts
                audioHash = audioHash.split('?')[0].split('#')[0].replace(/\/$/, '');

                setAudioUrl(audioHash);
            }

            if (audioDescAttr) {
                setAudioDesc(audioDescAttr.value);
            }
        }
    }, [isOpen, currentMetadata]);

    const updateBasicInfo = (field: keyof NFTMetadata, value: string) => {
        setNftData(prev => ({ ...prev, [field]: value }));
    };

    const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
        const newAttributes = [...nftData.attributes];
        newAttributes[index] = { ...newAttributes[index], [field]: value };
        setNftData(prev => ({ ...prev, attributes: newAttributes }));
    };

    const addAttribute = () => {
        setNftData(prev => ({
            ...prev,
            attributes: [...prev.attributes, { trait_type: '', value: '' }]
        }));
    };

    const removeAttribute = (index: number) => {
        setNftData(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index)
        }));
    };

    const buildMetadataPayload = () => {
        return {
            name: nftData.name,
            description: nftData.description,
            image: imageUrl ? `ipfs://ipfs/${imageUrl}` : currentMetadata?.image || '',
            external_url: nftData.external_url,
            attributes: [
                ...nftData.attributes.filter(attr => attr.trait_type && attr.value),
                ...(audioUrl ? [{ trait_type: 'audio', value: `ipfs://ipfs/${audioUrl}` }] : []),
                ...(audioDesc ? [{ trait_type: 'audio_description', value: audioDesc }] : [])
            ]
        };
    };

    return {
        nftData,
        imageUrl,
        audioUrl,
        audioDesc,
        setImageUrl,
        setAudioUrl,
        setAudioDesc,
        updateBasicInfo,
        updateAttribute,
        addAttribute,
        removeAttribute,
        buildMetadataPayload
    };
}
