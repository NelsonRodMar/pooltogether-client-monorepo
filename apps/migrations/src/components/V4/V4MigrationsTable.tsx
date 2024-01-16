import { useScreenSize } from '@shared/generic-react-hooks'
import { TokenValueAndAmount } from '@shared/react-components'
import { TokenWithAmount } from '@shared/types'
import { Button, Table, TableData } from '@shared/ui'
import classNames from 'classnames'
import Link from 'next/link'
import { Address } from 'viem'
import { TokenBadge } from '@components/TokenBadge'
import { V4_POOLS } from '@constants/config'
import { useUserV4Balances, V4BalanceToMigrate } from '@hooks/useUserV4Balances'
import { WithdrawButton } from './WithdrawButton'

export interface V4MigrationsTableProps {
  userAddress: Address
  className?: string
}

export const V4MigrationsTable = (props: V4MigrationsTableProps) => {
  const { userAddress, className } = props

  const { data: userV4Balances } = useUserV4Balances(userAddress)

  const { isMobile } = useScreenSize()

  const tableData: TableData = {
    headers: {
      token: { content: 'Token' },
      status: { content: 'Status', position: 'center' },
      rewards: { content: 'Unclaimed Rewards', position: 'center' },
      balance: { content: 'Your Balance', position: 'center' },
      manage: { content: 'Manage', position: 'right' }
    },
    rows: userV4Balances.map((migration) => ({
      id: `v4Migration-${migration.token.chainId}-${migration.contractAddress}`,
      cells: {
        token: { content: <TokenBadge token={migration.token} /> },
        status: {
          content: <StatusItem />,
          position: 'center'
        },
        rewards: {
          content: <RewardsItem chainId={migration.token.chainId} userAddress={userAddress} />,
          position: 'center'
        },
        balance: { content: <BalanceItem token={migration.token} />, position: 'center' },
        manage: { content: <ManageItem migration={migration} />, position: 'right' }
      }
    }))
  }

  if (isMobile) {
    return (
      <div className='w-full flex flex-col gap-4 items-center'>
        {userV4Balances.map((migration) => (
          <V4MigrationCard
            key={`v4Migration-${migration.token.chainId}-${migration.contractAddress}`}
            migration={migration}
          />
        ))}
      </div>
    )
  }

  return (
    <Table
      keyPrefix='v4Migrations'
      data={tableData}
      className={classNames('w-full rounded-t-2xl rounded-b-[2.5rem]', className)}
      innerClassName='!gap-3'
      headerClassName='px-4'
      rowClassName='!px-4 py-4 rounded-3xl'
    />
  )
}

interface V4MigrationCardProps {
  migration: V4BalanceToMigrate
  className?: string
}

const V4MigrationCard = (props: V4MigrationCardProps) => {
  const { migration, className } = props

  // TODO

  return <></>
}

interface StatusItemProps {
  className?: string
}

const StatusItem = (props: StatusItemProps) => {
  const { className } = props

  return <span className={classNames('text-pt-purple-100', className)}>Deprecated</span>
}

interface RewardsItemProps {
  chainId: number
  userAddress: Address
  className?: string
}

const RewardsItem = (props: RewardsItemProps) => {
  const { chainId, userAddress, className } = props

  // TODO: display unclaimed OP rewards if item is on OP, if any

  return <>-</>
}

interface BalanceItemProps {
  token: TokenWithAmount
  className?: string
}

const BalanceItem = (props: BalanceItemProps) => {
  const { token, className } = props

  const underlyingTokenAddress = V4_POOLS[token.chainId]?.underlyingTokenAddress

  return (
    <TokenValueAndAmount
      token={{ ...token, address: underlyingTokenAddress ?? token.address }}
      className={className}
    />
  )
}

interface ManageItemProps {
  migration: V4BalanceToMigrate
  className?: string
}

const ManageItem = (props: ManageItemProps) => {
  const { migration, className } = props

  const migrationURL = `/migrate/${migration.token.chainId}/v4/${migration.token.address}`

  return (
    <div className={classNames('flex gap-2 items-center', className)}>
      <WithdrawButton migration={migration} color='transparent' className='min-w-[6rem]' />
      <Link href={migrationURL} passHref={true}>
        <Button>Migrate</Button>
      </Link>
    </div>
  )
}
