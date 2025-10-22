import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NFTBasicInfo {
    name: string;
    description: string;
    external_url: string;
}

interface NFTBasicInfoFormProps {
    data: NFTBasicInfo;
    onChange: (field: keyof NFTBasicInfo, value: string) => void;
}

export function NFTBasicInfoForm({ data, onChange }: NFTBasicInfoFormProps) {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="name" className="text-white">NFT Name:</Label>
                <Input
                    type="text"
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Enter NFT name"
                />
            </div>

            <div>
                <Label htmlFor="description" className="text-white">Description:</Label>
                <Input
                    type="text"
                    id="description"
                    name="description"
                    value={data.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Enter description"
                />
            </div>

            <div>
                <Label htmlFor="external_url" className="text-white">External URL:</Label>
                <Input
                    type="text"
                    id="external_url"
                    name="external_url"
                    value={data.external_url}
                    onChange={(e) => onChange('external_url', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="https://example.com"
                />
            </div>
        </div>
    );
}
