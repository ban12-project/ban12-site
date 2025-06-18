import { default as PagePrimitive } from '../../../follow-up/[id]/page'
import Drawer from './drawer'

export default function Page(
  props: React.ComponentProps<typeof PagePrimitive>,
) {
  return (
    <Drawer>
      <PagePrimitive {...props} />
    </Drawer>
  )
}
