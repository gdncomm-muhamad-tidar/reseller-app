import type { Component } from 'vue';
import ArrowLeft from '@blibli/blue-dls-library-icon/dist/ArrowLeft';
import ChevronRight from '@blibli/blue-dls-library-icon/dist/ChevronRight';
import ChevronDown from '@blibli/blue-dls-library-icon/dist/ChevronDown';
import Chat from '@blibli/blue-dls-library-icon/dist/Chat';
import Notification from '@blibli/blue-dls-library-icon/dist/Notification';
import VoucherApplied from '@blibli/blue-dls-library-icon/dist/VoucherApplied';
import CashIn from '@blibli/blue-dls-library-icon/dist/CashIn';
import PaymentReceipt from '@blibli/blue-dls-library-icon/dist/PaymentReceipt';
import Scan from '@blibli/blue-dls-library-icon/dist/Scan';
import Home from '@blibli/blue-dls-library-icon/dist/Home';
import Category from '@blibli/blue-dls-library-icon/dist/Category';
import Order from '@blibli/blue-dls-library-icon/dist/Order';
import Wallet from '@blibli/blue-dls-library-icon/dist/Wallet';
import Location from '@blibli/blue-dls-library-icon/dist/Location';
import Time from '@blibli/blue-dls-library-icon/dist/Time';
import Copy from '@blibli/blue-dls-library-icon/dist/Copy';
import Check from '@blibli/blue-dls-library-icon/dist/Check';
import CircleCheck from '@blibli/blue-dls-library-icon/dist/CircleCheck';
import Plus from '@blibli/blue-dls-library-icon/dist/Plus';
import Minus from '@blibli/blue-dls-library-icon/dist/Minus';
import Delete from '@blibli/blue-dls-library-icon/dist/Delete';
import Cross from '@blibli/blue-dls-library-icon/dist/Cross';
import CircleInfo from '@blibli/blue-dls-library-icon/dist/CircleInfo';
import Mission from '@blibli/blue-dls-library-icon/dist/Mission';
import Bag from '@blibli/blue-dls-library-icon/dist/Bag';
import Discount from '@blibli/blue-dls-library-icon/dist/Discount';
import Ticket from '@blibli/blue-dls-library-icon/dist/Ticket';
import ArrowUp from '@blibli/blue-dls-library-icon/dist/ArrowUp';
import ArrowUpprice from '@blibli/blue-dls-library-icon/dist/ArrowUpprice';
import ArrowDownprice from '@blibli/blue-dls-library-icon/dist/ArrowDownprice';
import Gift from '@blibli/blue-dls-library-icon/dist/Gift';
import HotDeals from '@blibli/blue-dls-library-icon/dist/HotDeals';
import Alert from '@blibli/blue-dls-library-icon/dist/Alert';
import PointsBlibli from '@blibli/blue-dls-library-icon/dist/PointsBlibli';
import Download from '@blibli/blue-dls-library-icon/dist/Download';
import CircleOutlineInfo from '@blibli/blue-dls-library-icon/dist/CircleOutlineInfo';
import Search from '@blibli/blue-dls-library-icon/dist/Search';
import Locked from '@blibli/blue-dls-library-icon/dist/Locked';

/** App icon names → BLUE system icons (@blibli/blue-dls-library-icon). */
export const ICONS = {
  back: ArrowLeft, chev: ChevronRight, chevD: ChevronDown, chat: Chat, bell: Notification, voucher: VoucherApplied,
  cashIn: CashIn, receipt: PaymentReceipt, scan: Scan, scanNav: Scan, home: Home, grid: Category, box: Order, wallet: Wallet,
  pin: Location, time: Time, copy: Copy, check: Check, circleCheck: CircleCheck, plus: Plus, minus: Minus, trash: Delete,
  close: Cross, info: CircleInfo, mission: Mission, bag: Bag, cart: Bag, discount: Discount, ticket: Ticket, arrowUp: ArrowUp,
  trendUp: ArrowUpprice, trendDown: ArrowDownprice, gift: Gift, hotDeals: HotDeals, alertFill: Alert, alert: Alert,
  pointsLine: PointsBlibli, download: Download, infoLine: CircleOutlineInfo, search: Search, shield: Locked,
} as const satisfies Record<string, Component>;

export type IconName = keyof typeof ICONS;
export type ArtName = 'success-check' | 'points-blibli' | 'badge-gold' | 'medallion' | 'coin-gold' | 'supergraphic' | 'tier-gold' | 'tier-classic' | 'tier-platinum' | 'tier-infinite' | 'inspiration';
