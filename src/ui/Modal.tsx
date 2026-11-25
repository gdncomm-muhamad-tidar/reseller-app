/* 🅑 BLUE 3.0 Modal — dialog default (blue.blibli.com/blue3/components/modal).
 * Every pop up / bottom sheet in the app is built from these three parts, rendered inside
 * the overlay sheet (bottom, radius 16, elevation/default, no drag handle):
 *   <ModalHeader onClose title? trailing?>   — .🅑 modal.header: close (24px, 4px pad) + title (subtitle-1)
 *   <ModalBody>                             — .🅑 modal.body: 16px sides
 *   <ModalFooter>                           — .🅑 modal.footer: 16px, buttons stacked (primary first)
 * Use `keepAlive` on the header to hide the close button (BLUE keep-alive). */
import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { C } from '../theme';
import { IconBtn, Row, T } from './index';

export function ModalHeader({ title, onClose, trailing, keepAlive }: { title?: string; onClose?: () => void; trailing?: ReactNode; keepAlive?: boolean }) {
  return (
    <Row gap={8} style={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'flex-start' }}>
      {!keepAlive && <View style={{ padding: 4 }}><IconBtn name="close" color={C.icon} onPress={onClose} /></View>}
      <View style={{ flex: 1, minHeight: 32, paddingVertical: 6, justifyContent: 'center' }}>{!!title && <T v="s1">{title}</T>}</View>
      {trailing}
    </Row>
  );
}

export function ModalBody({ children, style, noPadding }: { children: ReactNode; style?: StyleProp<ViewStyle>; noPadding?: boolean }) {
  return <View style={[!noPadding && { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 }, style]}>{children}</View>;
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return <View style={{ padding: 16, gap: 8 }}>{children}</View>;
}
