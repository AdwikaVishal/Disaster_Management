package com.example.blockchain;

import io.reactivex.Flowable;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.BaseEventResponse;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

/**
 * <p>Auto generated code.
 * <p><strong>Do not modify!</strong>
 * <p>Please use the <a href="https://docs.web3j.io/command_line.html">web3j command line tools</a>,
 * or the org.web3j.codegen.SolidityFunctionWrapperGenerator in the 
 * <a href="https://github.com/LFDT-web3j/web3j/tree/main/codegen">codegen module</a> to update.
 *
 * <p>Generated with web3j version 1.7.0.
 */
@SuppressWarnings("rawtypes")
public class IncidentAudit extends Contract {
    public static final String BINARY = "Bin file was not provided";

    public static final String FUNC_LOGRESOLVED = "logResolved";

    public static final String FUNC_LOGRESOURCE = "logResource";

    public static final String FUNC_LOGVERIFIED = "logVerified";

    public static final Event INCIDENTRESOLVED_EVENT = new Event("IncidentResolved", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}, new TypeReference<Address>() {}, new TypeReference<Uint256>() {}));
    ;

    public static final Event INCIDENTVERIFIED_EVENT = new Event("IncidentVerified", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}, new TypeReference<Address>() {}, new TypeReference<Uint256>() {}));
    ;

    public static final Event RESOURCEASSIGNED_EVENT = new Event("ResourceAssigned", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Address>() {}, new TypeReference<Uint256>() {}));
    ;

    @Deprecated
    protected IncidentAudit(String contractAddress, Web3j web3j, Credentials credentials,
            BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected IncidentAudit(String contractAddress, Web3j web3j, Credentials credentials,
            ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected IncidentAudit(String contractAddress, Web3j web3j,
            TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected IncidentAudit(String contractAddress, Web3j web3j,
            TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static List<IncidentResolvedEventResponse> getIncidentResolvedEvents(
            TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(INCIDENTRESOLVED_EVENT, transactionReceipt);
        ArrayList<IncidentResolvedEventResponse> responses = new ArrayList<IncidentResolvedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            IncidentResolvedEventResponse typedResponse = new IncidentResolvedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.incidentId = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.admin = (String) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse.timestamp = (BigInteger) eventValues.getNonIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public static IncidentResolvedEventResponse getIncidentResolvedEventFromLog(Log log) {
        Contract.EventValuesWithLog eventValues = staticExtractEventParametersWithLog(INCIDENTRESOLVED_EVENT, log);
        IncidentResolvedEventResponse typedResponse = new IncidentResolvedEventResponse();
        typedResponse.log = log;
        typedResponse.incidentId = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
        typedResponse.admin = (String) eventValues.getNonIndexedValues().get(1).getValue();
        typedResponse.timestamp = (BigInteger) eventValues.getNonIndexedValues().get(2).getValue();
        return typedResponse;
    }

    public Flowable<IncidentResolvedEventResponse> incidentResolvedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(log -> getIncidentResolvedEventFromLog(log));
    }

    public Flowable<IncidentResolvedEventResponse> incidentResolvedEventFlowable(
            DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(INCIDENTRESOLVED_EVENT));
        return incidentResolvedEventFlowable(filter);
    }

    public static List<IncidentVerifiedEventResponse> getIncidentVerifiedEvents(
            TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(INCIDENTVERIFIED_EVENT, transactionReceipt);
        ArrayList<IncidentVerifiedEventResponse> responses = new ArrayList<IncidentVerifiedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            IncidentVerifiedEventResponse typedResponse = new IncidentVerifiedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.incidentId = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.admin = (String) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse.timestamp = (BigInteger) eventValues.getNonIndexedValues().get(2).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public static IncidentVerifiedEventResponse getIncidentVerifiedEventFromLog(Log log) {
        Contract.EventValuesWithLog eventValues = staticExtractEventParametersWithLog(INCIDENTVERIFIED_EVENT, log);
        IncidentVerifiedEventResponse typedResponse = new IncidentVerifiedEventResponse();
        typedResponse.log = log;
        typedResponse.incidentId = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
        typedResponse.admin = (String) eventValues.getNonIndexedValues().get(1).getValue();
        typedResponse.timestamp = (BigInteger) eventValues.getNonIndexedValues().get(2).getValue();
        return typedResponse;
    }

    public Flowable<IncidentVerifiedEventResponse> incidentVerifiedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(log -> getIncidentVerifiedEventFromLog(log));
    }

    public Flowable<IncidentVerifiedEventResponse> incidentVerifiedEventFlowable(
            DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(INCIDENTVERIFIED_EVENT));
        return incidentVerifiedEventFlowable(filter);
    }

    public static List<ResourceAssignedEventResponse> getResourceAssignedEvents(
            TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(RESOURCEASSIGNED_EVENT, transactionReceipt);
        ArrayList<ResourceAssignedEventResponse> responses = new ArrayList<ResourceAssignedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            ResourceAssignedEventResponse typedResponse = new ResourceAssignedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.incidentId = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.resourceId = (String) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse.admin = (String) eventValues.getNonIndexedValues().get(2).getValue();
            typedResponse.timestamp = (BigInteger) eventValues.getNonIndexedValues().get(3).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public static ResourceAssignedEventResponse getResourceAssignedEventFromLog(Log log) {
        Contract.EventValuesWithLog eventValues = staticExtractEventParametersWithLog(RESOURCEASSIGNED_EVENT, log);
        ResourceAssignedEventResponse typedResponse = new ResourceAssignedEventResponse();
        typedResponse.log = log;
        typedResponse.incidentId = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
        typedResponse.resourceId = (String) eventValues.getNonIndexedValues().get(1).getValue();
        typedResponse.admin = (String) eventValues.getNonIndexedValues().get(2).getValue();
        typedResponse.timestamp = (BigInteger) eventValues.getNonIndexedValues().get(3).getValue();
        return typedResponse;
    }

    public Flowable<ResourceAssignedEventResponse> resourceAssignedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(log -> getResourceAssignedEventFromLog(log));
    }

    public Flowable<ResourceAssignedEventResponse> resourceAssignedEventFlowable(
            DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(RESOURCEASSIGNED_EVENT));
        return resourceAssignedEventFlowable(filter);
    }

    public RemoteFunctionCall<TransactionReceipt> logResolved(BigInteger incidentId) {
        final Function function = new Function(
                FUNC_LOGRESOLVED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(incidentId)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> logResource(BigInteger incidentId,
            String resourceId) {
        final Function function = new Function(
                FUNC_LOGRESOURCE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(incidentId), 
                new org.web3j.abi.datatypes.Utf8String(resourceId)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> logVerified(BigInteger incidentId) {
        final Function function = new Function(
                FUNC_LOGVERIFIED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint256(incidentId)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    @Deprecated
    public static IncidentAudit load(String contractAddress, Web3j web3j, Credentials credentials,
            BigInteger gasPrice, BigInteger gasLimit) {
        return new IncidentAudit(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static IncidentAudit load(String contractAddress, Web3j web3j,
            TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new IncidentAudit(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static IncidentAudit load(String contractAddress, Web3j web3j, Credentials credentials,
            ContractGasProvider contractGasProvider) {
        return new IncidentAudit(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static IncidentAudit load(String contractAddress, Web3j web3j,
            TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new IncidentAudit(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static class IncidentResolvedEventResponse extends BaseEventResponse {
        public BigInteger incidentId;

        public String admin;

        public BigInteger timestamp;
    }

    public static class IncidentVerifiedEventResponse extends BaseEventResponse {
        public BigInteger incidentId;

        public String admin;

        public BigInteger timestamp;
    }

    public static class ResourceAssignedEventResponse extends BaseEventResponse {
        public BigInteger incidentId;

        public String resourceId;

        public String admin;

        public BigInteger timestamp;
    }
}
