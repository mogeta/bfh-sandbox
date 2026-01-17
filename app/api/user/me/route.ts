import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BFH_API_BASE_URL } from '@/src/config/env';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('bfh_access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // BFH APIからユーザー情報を取得
    const response = await fetch(
      `${BFH_API_BASE_URL}/v1/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // トークンが無効な場合、クッキーを削除
        cookieStore.delete('bfh_access_token');
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        );
      }
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
