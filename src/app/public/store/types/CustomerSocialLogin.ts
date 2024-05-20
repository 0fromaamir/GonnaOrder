export interface SocialAccountLoginDetails {
    provider: string;
    accessToken: string;
    countryId: string;
    appleCode: string;
    firstName?: string;
    lastName?: string;
}

export interface CustomerSocialLoginResponse {
    userId: number;
    userName: string;
    tokens: Tokens;
    phoneNumber?: string;
    email?: string;
    floorNumber?: string;
    streetAddress?: string;
    city?: string;
    postCode?: string;
}

export interface CustomerDetailsUpdateRequest {
    tokens: Tokens;
    userName?: string;
    phoneNumber?: string;
    floorNumber?: string;
    streetAddress?: string;
    city?: string;
    postCode?: string;
    email?: string;
}

export class Tokens {
    jwt: string;
    refreshToken: string;
}
