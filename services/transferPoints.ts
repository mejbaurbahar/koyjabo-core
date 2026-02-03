// Transfer points where users can switch between different transport modes
export interface TransferPoint {
    id: string;
    name: string;
    bnName: string;
    lat: number;
    lng: number;
    modes: ('bus' | 'metro' | 'railway')[];
    nearbyStations: string[]; // Station IDs within walking distance
    metroStations?: string[]; // Metro station IDs if applicable
    railwayStations?: string[]; // Railway station IDs if applicable
}

export const TRANSFER_POINTS: Record<string, TransferPoint> = {
    // Major Transfer Hubs
    'kamalapur': {
        id: 'kamalapur',
        name: 'Kamalapur',
        bnName: 'কমলাপুর',
        lat: 23.7308,
        lng: 90.4264,
        modes: ['bus', 'metro', 'railway'],
        nearbyStations: ['kamalapur', 'malibagh', 'rajarbagh'],
        metroStations: ['kamalapur'],
        railwayStations: ['kamalapur']
    },
    'motijheel': {
        id: 'motijheel',
        name: 'Motijheel',
        bnName: 'মতিঝিল',
        lat: 23.7334,
        lng: 90.4176,
        modes: ['bus', 'metro'],
        nearbyStations: ['motijheel', 'shapla_chattar', 'paltan'],
        metroStations: ['secretariat', 'dhaka_university']
    },
    'farmgate': {
        id: 'farmgate',
        name: 'Farmgate',
        bnName: 'ফার্মগেট',
        lat: 23.7577,
        lng: 90.3897,
        modes: ['bus', 'metro'],
        nearbyStations: ['farmgate', 'karwan_bazar', 'tejgaon'],
        metroStations: ['farmgate', 'karwan_bazar']
    },
    'mirpur_10': {
        id: 'mirpur_10',
        name: 'Mirpur 10',
        bnName: 'মিরপুর ১০',
        lat: 23.8069,
        lng: 90.3687,
        modes: ['bus', 'metro'],
        nearbyStations: ['mirpur_10', 'mirpur_11', 'mirpur_12'],
        metroStations: ['mirpur_10']
    },
    'uttara': {
        id: 'uttara',
        name: 'Uttara',
        bnName: 'উত্তরা',
        lat: 23.8759,
        lng: 90.3795,
        modes: ['bus', 'metro'],
        nearbyStations: ['uttara', 'uttara_sector_3', 'uttara_sector_7'],
        metroStations: ['uttara_south', 'uttara_center', 'uttara_north']
    },
    'mohakhali': {
        id: 'mohakhali',
        name: 'Mohakhali',
        bnName: 'মহাখালী',
        lat: 23.7808,
        lng: 90.4067,
        modes: ['bus', 'metro'],
        nearbyStations: ['mohakhali', 'wireless_gate', 'banani'],
        metroStations: ['agargaon']
    },
    'gabtoli': {
        id: 'gabtoli',
        name: 'Gabtoli',
        bnName: 'গাবতলী',
        lat: 23.7789,
        lng: 90.3542,
        modes: ['bus'],
        nearbyStations: ['gabtoli', 'aminbazar', 'technical']
    },
    'sayedabad': {
        id: 'sayedabad',
        name: 'Sayedabad',
        bnName: 'সায়েদাবাদ',
        lat: 23.7347,
        lng: 90.4319,
        modes: ['bus'],
        nearbyStations: ['sayedabad', 'jatrabari', 'mugda']
    },
    'gulistan': {
        id: 'gulistan',
        name: 'Gulistan',
        bnName: 'গুলিস্তান',
        lat: 23.7258,
        lng: 90.4126,
        modes: ['bus', 'metro'],
        nearbyStations: ['gulistan', 'paltan', 'bangabhaban'],
        metroStations: ['dhaka_university', 'secretariat']
    },
    'shahbagh': {
        id: 'shahbagh',
        name: 'Shahbagh',
        bnName: 'শাহবাগ',
        lat: 23.7389,
        lng: 90.3958,
        modes: ['bus', 'metro'],
        nearbyStations: ['shahbagh', 'tsc', 'bangla_motor'],
        metroStations: ['shahbagh']
    },
    'mogbazar': {
        id: 'mogbazar',
        name: 'Mogbazar',
        bnName: 'মগবাজার',
        lat: 23.7503,
        lng: 90.4053,
        modes: ['bus'],
        nearbyStations: ['mogbazar', 'malibagh', 'wireless_gate']
    },
    'basabo': {
        id: 'basabo',
        name: 'Basabo',
        bnName: 'বাসাবো',
        lat: 23.7425,
        lng: 90.4289,
        modes: ['bus'],
        nearbyStations: ['basabo', 'rajarbagh', 'malibagh']
    },
    'kuril': {
        id: 'kuril',
        name: 'Kuril',
        bnName: 'কুড়িল',
        lat: 23.8188,
        lng: 90.4131,
        modes: ['bus'],
        nearbyStations: ['kuril', 'kuril_chourasta', 'shewra', 'bashundhara_300_feet']
    },
    'notun_bazar': {
        id: 'notun_bazar',
        name: 'Notun Bazar',
        bnName: 'নতুন বাজার',
        lat: 23.7978,
        lng: 90.4234,
        modes: ['bus'],
        nearbyStations: ['notun_bazar', 'badda', 'shahjadpur']
    }
};

// Helper function to find nearest transfer point
export const findNearestTransferPoint = (lat: number, lng: number, maxDistance: number = 2000): TransferPoint | null => {
    let nearest: TransferPoint | null = null;
    let minDistance = maxDistance;

    Object.values(TRANSFER_POINTS).forEach(point => {
        const R = 6371e3;
        const φ1 = (lat * Math.PI) / 180;
        const φ2 = (point.lat * Math.PI) / 180;
        const Δφ = ((point.lat - lat) * Math.PI) / 180;
        const Δλ = ((point.lng - lng) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance < minDistance) {
            minDistance = distance;
            nearest = point;
        }
    });

    return nearest;
};
