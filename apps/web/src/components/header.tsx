import reactLogo from '@/assets/react-icon.svg'
import Image from 'next/image'
import { ProfileButton } from './profile-button'
import { Slash } from 'lucide-react'
import { OrganizationSwitecher } from './organization-switcher'
import { ability } from '@/auth/auth'

export async function Header() {
  const permissions = await ability()
  return (
    <div className="mx-auto flex max-w-[1200px] items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src={reactLogo} alt="React" className="size-6 dark:invert" />
        <Slash className="-rotate[240deg] size-3 text-border" />
        <OrganizationSwitecher />
        {permissions?.can('get', 'Project') && <p>Projetos</p>}
      </div>
      <div className="flex items-center gap-4">
        <ProfileButton />
      </div>
    </div>
  )
}
