import { PET_SIZES, type PetSize } from '../../../domain/booking';
import { fmtMoney, packagePrice, type PackageLike } from '../../../pricing/engine';
import './GroomingPriceMenu.css';

export interface GroomingPriceMenuProps { packages: (PackageLike & { tier?: string; inclusions?: string | null })[]; highlightSize?: PetSize | null; caption?: string }

/** Price menu: packages × sizes grid from the packages table (Spa price card), highlighting the current pet's size column. */
export function GroomingPriceMenu({ packages, highlightSize, caption }: GroomingPriceMenuProps) {
  return (
    <div className="pricemenu">
      <table className="pricemenu-table">
        {caption && <caption className="xs muted">{caption}</caption>}
        <thead><tr><th scope="col">Package</th>{PET_SIZES.map((s) => <th key={s} scope="col" className={s === highlightSize ? 'is-hl' : ''}>{s}</th>)}</tr></thead>
        <tbody>
          {packages.map((p) => (
            <tr key={p.id}>
              <th scope="row" title={p.inclusions ?? undefined}><span className="pricemenu-name">{p.name}</span></th>
              {PET_SIZES.map((s) => <td key={s} className={s === highlightSize ? 'is-hl' : ''}>{fmtMoney(packagePrice(p, s))}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="xs faint pricemenu-legend">S under 20 lb · M 20-39 · L 40-69 · XL 70-99 · Giant 100 lb and up</p>
    </div>
  );
}
