export const cx = (...args: (string | null | undefined | false)[]) =>
  args.filter((a) => !!a).join(' ');
