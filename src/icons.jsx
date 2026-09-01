const S = ({ children, size = 20, fill = 'none', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
);

export const IUser = (p) => <S {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></S>;
export const IMail = (p) => <S {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" /></S>;
export const ILock = (p) => <S {...p}><rect x="4.5" y="10" width="15" height="10" rx="2.5" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /></S>;
export const IEye = (p) => <S {...p}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /></S>;
export const IEyeOff = (p) => <S {...p}><path d="M4 4l16 16" /><path d="M9.9 5.7A10.6 10.6 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.3 4.1M6.4 7.6A17 17 0 0 0 2 12s3.6 6.5 10 6.5c1.2 0 2.3-.2 3.3-.5" /></S>;
export const ISearch = (p) => <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></S>;
export const ICompass = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></S>;
export const IMap = (p) => <S {...p}><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 7 9 4Z" /><path d="M9 4v13M15 7v12.5" /></S>;
export const IArrow = (p) => <S {...p}><path d="M4 12h15m0 0-6-6m6 6-6 6" /></S>;
export const IBack = (p) => <S {...p}><path d="M20 12H5m0 0 6-6m-6 6 6 6" /></S>;
export const IChevron = (p) => <S {...p}><path d="m9 5 7 7-7 7" /></S>;
export const ISpark = (p) => <S {...p}><path d="M13 2.5 15.2 8 21 10.2 15.2 12.4 13 18l-2.2-5.6L5 10.2 10.8 8 13 2.5Z" /><circle cx="5.5" cy="17.5" r="1.6" /><path d="M18.5 17v3M17 18.5h3" /></S>;
export const ICal = (p) => <S {...p}><rect x="3.5" y="5" width="17" height="16" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></S>;
export const IDollar = (p) => <S {...p}><path d="M12 2.5v19" /><path d="M16.5 7c0-1.9-2-3-4.5-3S7.5 5.1 7.5 7s2 2.8 4.5 3.2 4.5 1.3 4.5 3.3-2 3.2-4.5 3.2-4.5-1.2-4.5-3.1" /></S>;
export const IList = (p) => <S {...p}><path d="M9 6h12M9 12h12M9 18h12" /><path d="m3 6 1.3 1.4L7 4.6M3 17l1.3 1.4L7 15.6" /></S>;
export const IBank = (p) => <S {...p}><path d="M3 10h18M4.5 10v8M9.5 10v8M14.5 10v8M19.5 10v8M2.5 21h19M12 3 3 8h18l-9-5Z" /></S>;
export const IFood = (p) => <S {...p}><path d="M4 3v7a3 3 0 0 0 6 0V3M7 10v11" /><path d="M17.5 3c-1.5 2-2 4-2 6.5 0 1.5.8 2.5 2 2.5V3ZM17.5 12v9" /></S>;
export const IBed = (p) => <S {...p}><path d="M3 18v-9M3 13h18a0 0 0 0 1 0 0v5M21 18v-3" /><circle cx="7.5" cy="10" r="1.8" /><path d="M11 13v-2a1 1 0 0 1 1-1h6a3 3 0 0 1 3 3" /></S>;
export const ITrain = (p) => <S {...p}><rect x="6" y="3" width="12" height="13" rx="4" /><path d="M6 10h12M9 20l-2 2M15 20l2 2M8.5 16.5h.01M15.5 16.5h.01" /></S>;
export const IBag = (p) => <S {...p}><path d="M4 8h16l-1.2 12H5.2L4 8Z" /><path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" /></S>;
export const ITrash = (p) => <S {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></S>;
export const IPlus = (p) => <S {...p}><path d="M12 5v14M5 12h14" /></S>;
export const ISend = (p) => <S {...p}><path d="M21 3 10.5 13.5M21 3l-6.5 18-4-8-8-4L21 3Z" /></S>;
export const ICheck = (p) => <S {...p}><path d="m5 12.5 4.5 4.5L19 6.5" /></S>;
export const IStar = (p) => <S fill="currentColor" stroke="none" {...p}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" /></S>;
export const IBookmark = (p) => <S {...p}><path d="M6 3.5h12v17l-6-4-6 4v-17Z" /></S>;
export const IShield = (p) => <S {...p}><path d="M12 2.5 20 6v6c0 5-3.4 8.3-8 9.5-4.6-1.2-8-4.5-8-9.5V6l8-3.5Z" /></S>;
export const IDoc = (p) => <S {...p}><path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5l-5-5Z" /><path d="M14 2.5v5h5M8.5 13h7M8.5 17h5" /></S>;
export const ILogout = (p) => <S {...p}><path d="M10 4.5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4" /><path d="M15 8.5l3.5 3.5L15 15.5M18 12H9" /></S>;
export const IClock = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 2" /></S>;
export const IWallet = (p) => <S {...p}><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18M16.5 14.5h.01" /></S>;
export const IPin = (p) => <S {...p}><path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></S>;
export const IGlobe = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9S14.5 18.3 12 21c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3Z" /></S>;
export const ISun = (p) => <S {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" /></S>;
export const IPhone = (p) => <S {...p}><path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2L21 14.5v3a2.5 2.5 0 0 1-2.7 2.5A16.5 16.5 0 0 1 4 5.7 2.5 2.5 0 0 1 6.5 3Z" /></S>;
export const IShare = (p) => <S {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" /></S>;
export const ILink = (p) => <S {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></S>;
export const ICopy = (p) => <S {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></S>;
export const IDownload = (p) => <S {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></S>;
export const ICloudOff = (p) => <S {...p}><path d="m2 2 20 20M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.954-.443M22.61 16.927A5 5 0 0 0 18 10h-1.26A8 8 0 0 0 4 10" /></S>;
export const IWifiOff = (p) => <S {...p}><line x1="2" x2="22" y1="2" y2="22" /><path d="M12 20h.01M8.5 16.429a5 5 0 0 1 7 0M5 12.859a10 10 0 0 1 5.17-2.69M19 12.859a10 10 0 0 0-2.007-1.523M2 8.82a15 15 0 0 1 4.177-2.643M22 8.82a15 15 0 0 0-11.288-3.764" /></S>;
export const IRefresh = (p) => <S {...p}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></S>;
export const IPhoneAdd = (p) => <S {...p}><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01M12 8v6M9 11h6" /></S>;

