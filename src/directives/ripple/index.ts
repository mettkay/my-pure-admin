import { Directive, DirectiveBinding } from "vue";

export interface RippleDirectiveBinding
  extends Omit<DirectiveBinding, "modifiers" | "value"> {
  value?: boolean | { class: string };
  modifiers: {
    center?: boolean;
    circle?: boolean;
  };
}

// function mounted(el: HTMLElement, binding: RippleDirectiveBinding) {
//   updateRipple(el, binding, false);
// }

// export const Ripple: Directive = {
//   mounted,
//   unmounted,
//   updated,
// };
