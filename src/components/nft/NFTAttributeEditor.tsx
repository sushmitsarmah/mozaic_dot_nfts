import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Attribute {
    trait_type: string;
    value: string;
}

interface NFTAttributeEditorProps {
    attributes: Attribute[];
    onAttributeChange: (index: number, field: 'trait_type' | 'value', value: string) => void;
    onAddAttribute: () => void;
    onRemoveAttribute: (index: number) => void;
}

export function NFTAttributeEditor({
    attributes,
    onAttributeChange,
    onAddAttribute,
    onRemoveAttribute
}: NFTAttributeEditorProps) {
    return (
        <div className="space-y-3">
            <Label className="text-white">Attributes:</Label>
            {attributes.map((attribute, index) => (
                <div key={index} className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Trait Type"
                        value={attribute.trait_type}
                        onChange={(e) => onAttributeChange(index, 'trait_type', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Input
                        type="text"
                        placeholder="Value"
                        value={attribute.value}
                        onChange={(e) => onAttributeChange(index, 'value', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                    />
                    {attributes.length > 1 && (
                        <Button
                            type="button"
                            onClick={() => onRemoveAttribute(index)}
                            className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                            variant="outline"
                        >
                            Remove
                        </Button>
                    )}
                </div>
            ))}
            <Button
                type="button"
                onClick={onAddAttribute}
                className="bg-gray-700 hover:bg-gray-600 text-white w-full"
            >
                Add Attribute
            </Button>
        </div>
    );
}
