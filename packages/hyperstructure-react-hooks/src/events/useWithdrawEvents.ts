import { NO_REFETCH } from '@shared/generic-react-hooks'
import { getWithdrawEvents } from '@shared/utilities'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { usePublicClient } from 'wagmi'
import { QUERY_KEYS } from '../constants'

/**
 * Returns `Withdraw` events
 * @param chainId chain ID to query data in
 * @param vaultAddresses vault addresses to get events for
 * @param options optional settings
 * @returns
 */
export const useWithdrawEvents = (
  chainId: number,
  vaultAddresses: Address[],
  options?: {
    sender?: Address[]
    receiver?: Address[]
    owner?: Address[]
    fromBlock?: bigint
    toBlock?: bigint
  }
) => {
  const publicClient = usePublicClient({ chainId })

  const queryKey = [
    QUERY_KEYS.withdrawEvents,
    chainId,
    vaultAddresses,
    options?.sender,
    options?.receiver,
    options?.owner,
    options?.fromBlock?.toString(),
    options?.toBlock?.toString() ?? 'latest'
  ]

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!!publicClient) {
        return await getWithdrawEvents(publicClient, vaultAddresses, options)
      }
    },
    enabled: !!chainId && !!publicClient && !!vaultAddresses?.length,
    ...NO_REFETCH
  })
}
