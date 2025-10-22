import { Label } from "@/components/ui/label";
import ImageUploader from "@/web3/services/ipfs/uploadImage";
import AudioUploader from "@/web3/services/ipfs/uploadAudio";

interface NFTMediaUploaderProps {
    imageUrl: string;
    audioUrl: string;
    onImageChange: (url: string) => void;
    onAudioChange: (url: string) => void;
}

export function NFTMediaUploader({
    imageUrl,
    audioUrl,
    onImageChange,
    onAudioChange
}: NFTMediaUploaderProps) {
    const getAudioType = (url: string) => {
        const extension = url.split('.').pop();
        return `audio/${extension}`;
    };

    return (
        <div className="space-y-4">
            {/* Image Upload */}
            <div>
                <Label htmlFor="image" className="text-white">Image:</Label>
                <ImageUploader setImageUrl={onImageChange} />
                <input type="hidden" name="image" value={imageUrl} />
                {imageUrl && (
                    <img
                        width={100}
                        height={100}
                        src={`https://gateway.pinata.cloud/ipfs/${imageUrl}`}
                        alt="NFT Image"
                        className="mt-2 rounded"
                    />
                )}
            </div>

            {/* Audio Upload */}
            <div>
                <Label htmlFor="audio" className="text-white">Audio (Optional):</Label>
                <AudioUploader setAudioUrl={onAudioChange} />
                {audioUrl && (
                    <audio controls className="mt-2 w-full">
                        <source
                            src={`https://gateway.pinata.cloud/ipfs/${audioUrl}`}
                            type={getAudioType(audioUrl)}
                        />
                        Your browser does not support the audio element.
                    </audio>
                )}
            </div>
        </div>
    );
}
