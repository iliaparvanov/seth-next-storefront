import { Badge } from "@medusajs/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold">Внимание:</span> Само за тестване.
    </Badge>
  )
}

export default PaymentTest
