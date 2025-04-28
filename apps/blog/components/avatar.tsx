import Image from 'next/image'

type Props = {
  name: string
  picture: string
}

const Avatar = ({ name, picture }: Props) => {
  return (
    <div className="inline-flex items-center">
      <Image
        width={420}
        height={420}
        src={picture}
        className="mr-4 h-12 w-12 rounded-full"
        alt={name}
      />
      <div className="text-xl font-bold">{name}</div>
    </div>
  )
}

export default Avatar
