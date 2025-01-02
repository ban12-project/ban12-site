export default function SmoothCorners() {
  return (
    <div
      className="mask-image-paint-smooth-corners h-96 w-96 bg-gradient-to-b from-red-400 to-red-500"
      style={
        {
          '--smooth-corners': 5,
        } as React.CSSProperties
      }
    ></div>
  )
}
