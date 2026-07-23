/**
 * أُدمج في `middleware/common/authMiddleware`.
 * `protectMobile` صار اسمًا بديلًا لـ `protect`.
 */
import { protect } from '../common/authMiddleware';

export const protectMobile = protect;

export default { protectMobile };
