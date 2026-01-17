'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface SphereMetadata {
  name: string;
  description: string;
  image: string;
  timestamp: number;
  language: string;
  attributes: {
    type_name: string;
    rarity: string;
    lv: number;
    hp: number;
    phy: number;
    int: number;
    agi: number;
    spr: number;
    def: number;
    ability_name: string;
    ability_description: string;
  };
}

interface SphereCardProps {
  sphereId: string | number;
  initialMetadata?: SphereMetadata;
  className?: string;
}

export function SphereCard({ sphereId, initialMetadata, className = '' }: SphereCardProps) {
  const [metadata, setMetadata] = useState<SphereMetadata | null>(initialMetadata || null);
  const [loading, setLoading] = useState(!initialMetadata);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMetadata) return;

    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/sphere/metadata/${sphereId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch sphere metadata');
        }

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [sphereId, initialMetadata]);

  if (loading) {
    return (
      <Card className={`glass-card border-0 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-neutral-700 rounded-lg"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metadata) {
    return (
      <Card className={`glass-card border-0 ${className}`}>
        <CardContent className="p-6 text-center text-red-400">
          Error loading sphere data
        </CardContent>
      </Card>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'text-gray-400';
      case 'uncommon':
        return 'text-green-400';
      case 'rare':
        return 'text-blue-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-orange-400';
      default:
        return 'text-white';
    }
  };

  return (
    <Card className={`glass-card glass-hover border-0 overflow-hidden ${className}`}>
      <div className="relative h-48 overflow-hidden bg-black/20">
        <img
          src={metadata.image}
          alt={metadata.name}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${getRarityColor(
              metadata.attributes.rarity
            )} bg-black/60 backdrop-blur-sm`}
          >
            {metadata.attributes.rarity}
          </span>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-white text-lg">
          {metadata.attributes.type_name}
        </CardTitle>
        <CardDescription className="text-neutral-300 text-sm">
          Level {metadata.attributes.lv}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">HP</span>
              <span className="text-white font-semibold">
                {(metadata.attributes.hp ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">PHY</span>
              <span className="text-white font-semibold">
                {(metadata.attributes.phy ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">INT</span>
              <span className="text-white font-semibold">
                {(metadata.attributes.int ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">AGI</span>
              <span className="text-white font-semibold">
                {(metadata.attributes.agi ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">SPR</span>
              <span className="text-white font-semibold">
                {(metadata.attributes.spr ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">DEF</span>
              <span className="text-white font-semibold">
                {(metadata.attributes.def ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-700 space-y-2">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Ability</p>
            <p className="text-sm text-cyan-300 font-medium">
              {metadata.attributes.ability_name}
            </p>
            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              {metadata.attributes.ability_description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
