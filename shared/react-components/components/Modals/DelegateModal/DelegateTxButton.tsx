import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSendDelegateTransaction,
  useUserVaultDelegate,
  useVaultTokenData
} from '@generationsoftware/hyperstructure-react-hooks'
import { Intl } from '@shared/types'
import { Spinner } from '@shared/ui'
import { Button } from '@shared/ui'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { Address, isAddress } from 'viem'
import { useAccount, useNetwork } from 'wagmi'
import { DelegateModalView } from '.'
import { delegateFormNewDelegateAddressAtom } from '../../Form/DelegateForm'
import { createDelegateTxToast, DelegateTxToastProps } from '../../Toasts/DelegateTxToast'
import { TransactionButton } from '../../Transaction/TransactionButton'

interface DelegateTxButtonProps {
  twabController: Address
  vault: Vault
  modalView: string
  setModalView: (view: DelegateModalView) => void
  openConnectModal?: () => void
  openChainModal?: () => void
  addRecentTransaction?: (tx: { hash: string; description: string; confirmations?: number }) => void
  onSuccessfulDelegation?: () => void
  intl?: {
    base?: Intl<
      | 'updateDelegatedAddress'
      | 'delegateTx'
      | 'switchNetwork'
      | 'switchingNetwork'
      | 'confirmNotice'
      | 'waiting'
    >
    txToast?: DelegateTxToastProps['intl']
    common?: Intl<'connectWallet'>
  }
}

export const DelegateTxButton = (props: DelegateTxButtonProps) => {
  const {
    twabController,
    vault,
    modalView,
    setModalView,
    openConnectModal,
    openChainModal,
    addRecentTransaction,
    onSuccessfulDelegation,
    intl
  } = props

  const { address: userAddress, isDisconnected } = useAccount()
  const { chain } = useNetwork()

  const { data: tokenData } = useVaultTokenData(vault)

  const newDelegateAddress: Address | undefined = useAtomValue(delegateFormNewDelegateAddressAtom)

  const { data: delegate, refetch: refetchUserVaultDelegate } = useUserVaultDelegate(
    vault,
    userAddress as Address,
    { refetchOnWindowFocus: true }
  )

  const createToast = (delegateTxHash: Address) => {
    if (!!vault && !!delegateTxHash) {
      createDelegateTxToast({
        vault: vault,
        txHash: delegateTxHash,
        addRecentTransaction: addRecentTransaction,
        intl: intl?.txToast
      })
    }
  }

  const {
    isWaiting: isWaitingDelegation,
    isConfirming: isConfirmingDelegation,
    isSuccess: isSuccessfulDelegation,
    txHash: delegateTxHash,
    sendDelegateTransaction
  } = useSendDelegateTransaction(twabController, newDelegateAddress, vault, {
    onSend: () => {
      setModalView('confirming')
    },
    onSuccess: () => {
      refetchUserVaultDelegate()
      onSuccessfulDelegation?.()
      setModalView('main')
    },
    onError: () => {
      setModalView('main')
    }
  })

  useEffect(() => {
    if (isWaitingDelegation && modalView !== 'waiting') {
      setModalView('waiting')
    }
  }, [isWaitingDelegation])

  useEffect(() => {
    if (
      !!delegateTxHash &&
      isConfirmingDelegation &&
      !isWaitingDelegation &&
      !isSuccessfulDelegation
    ) {
      if (delegateTxHash) {
        createToast(delegateTxHash)
      }
      setModalView('confirming')
    }
  }, [delegateTxHash, isConfirmingDelegation])

  const delegateAddressHasChanged = newDelegateAddress !== delegate

  const delegateEnabled =
    !isDisconnected &&
    !!userAddress &&
    !!newDelegateAddress &&
    isAddress(newDelegateAddress) &&
    !isWaitingDelegation &&
    !isConfirmingDelegation &&
    delegateAddressHasChanged &&
    !!sendDelegateTransaction

  if (isDisconnected) {
    return null
  } else if (isWaitingDelegation) {
    return (
      <Button color='transparent' fullSized={true} disabled={true}>
        <Spinner />{' '}
        <span className='inline-block ml-2'>
          {intl?.base?.('confirmNotice') ?? 'Confirm Transaction in Wallet'}
        </span>
      </Button>
    )
  } else if (isConfirmingDelegation) {
    return (
      <Button color='transparent' fullSized={true} disabled={true}>
        <Spinner />
        <span className='inline-block ml-2'>
          {intl?.base?.('waiting') ?? 'Waiting for Transaction'}
        </span>
      </Button>
    )
  } else {
    return (
      <TransactionButton
        chainId={vault.chainId}
        isTxLoading={isWaitingDelegation || isConfirmingDelegation}
        isTxSuccess={isSuccessfulDelegation}
        write={sendDelegateTransaction}
        txHash={delegateTxHash}
        txDescription={
          intl?.base?.('delegateTx', { symbol: tokenData?.symbol ?? '?' }) ??
          `${tokenData?.symbol} Delegation`
        }
        fullSized={true}
        disabled={!delegateEnabled}
        color={!delegateEnabled && chain?.id === vault.chainId ? 'transparent' : 'teal'}
        openConnectModal={openConnectModal}
        openChainModal={openChainModal}
        addRecentTransaction={addRecentTransaction}
        intl={intl}
      >
        {intl?.base?.('updateDelegatedAddress') ?? 'Update delegated address'}
      </TransactionButton>
    )
  }
}
