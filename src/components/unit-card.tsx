'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface HeroMetadata {
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
    ex_ascension_phase: number;
    ex_ascension_level: number;
    brave_burst: string;
    art_skill: string;
  };
}

interface UnitCardProps {
  heroId: string | number;
  initialMetadata?: HeroMetadata;
  className?: string;
}

export function UnitCard({ heroId, initialMetadata, className = '' }: UnitCardProps) {
  const [metadata, setMetadata] = useState<HeroMetadata | null>(initialMetadata || null);
  const [loading, setLoading] = useState(!initialMetadata);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMetadata) return;

    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/hero/metadata/${heroId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch hero metadata');
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
  }, [heroId]);

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
          Error loading unit data
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
      <div className="relative h-48 overflow-hidden">
        <img
          src={metadata.image}
          alt={metadata.name}
          className="w-full h-full object-cover"
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
                {metadata.attributes.hp.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">PHY</span>
              <span className="text-white font-semibold">
                {metadata.attributes.phy.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">INT</span>
              <span className="text-white font-semibold">
                {metadata.attributes.int.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">AGI</span>
              <span className="text-white font-semibold">
                {metadata.attributes.agi.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">SPR</span>
              <span className="text-white font-semibold">
                {metadata.attributes.spr.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">DEF</span>
              <span className="text-white font-semibold">
                {metadata.attributes.def.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-700 space-y-2">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Brave Burst</p>
            <p className="text-sm text-purple-300">
              {metadata.attributes.brave_burst}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Art Skill</p>
            <p className="text-sm text-pink-300">{metadata.attributes.art_skill}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
